import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RbacSupabaseService } from './rbac.supabase.service';
import type { User, UserRole } from './types/user.type';

type Role = UserRole;

type SetUserRoleInput = {
  role: Role;
  reason?: string;
};

@Injectable()
export class RbacService {
  constructor(private readonly rbacDb: RbacSupabaseService) {}

  private get supabase() {
    return this.rbacDb.db;
  }

  private readonly rolePermissions: Record<Role, string[]> = {
    admin: ['*'],
    manager: ['users.read', 'clients.read', 'clients.write', 'projects.read', 'projects.write'],
    staff: ['clients.read', 'clients.write', 'projects.read'],
  };

  private isValidRole(role: any): role is Role {
    return role === 'admin' || role === 'staff' || role === 'manager';
  }

  private async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('user_id, team_id, name, email, role, auth_provider, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      const msg = error.message.toLowerCase();
      if (error.code === 'PGRST116' || msg.includes('0 rows') || msg.includes('no rows')) {
        return null;
      }
      throw new InternalServerErrorException(error.message);
    }

    return (data as User) ?? null;
  }

  private async requireAdmin(callerId: string): Promise<User> {
    const caller = await this.getUserById(callerId);
    if (!caller) throw new ForbiddenException('Caller is not an app user');
    if (caller.role !== 'admin') throw new ForbiddenException('Forbidden: admin role required');
    return caller;
  }

  private async requireSelfOrAdminSameTeam(callerId: string, targetUserId: string) {
    const caller = await this.getUserById(callerId);
    if (!caller) throw new ForbiddenException('Caller is not an app user');

    const target = await this.getUserById(targetUserId);
    if (!target) throw new NotFoundException('User not found');

    if (caller.user_id === target.user_id) return { caller, target };

    if (caller.role !== 'admin') throw new ForbiddenException('Forbidden');
    if (caller.team_id !== target.team_id) throw new ForbiddenException('Forbidden: cross-team access');

    return { caller, target };
  }

  private async requireAdminSameTeam(callerId: string, targetUserId: string) {
    const caller = await this.requireAdmin(callerId);
    const target = await this.getUserById(targetUserId);
    if (!target) throw new NotFoundException('User not found');
    if (caller.team_id !== target.team_id) throw new ForbiddenException('Forbidden: cross-team access');
    return { caller, target };
  }

  // uses your ERD table change_audit
  private async audit(params: {
    entity_type: string;
    entity_id: string;
    action: 'create' | 'update' | 'delete';
    performed_by: string;
    diff?: any;
  }) {
    const { error } = await this.supabase.from('change_audit').insert({
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      action: params.action,
      performed_by: params.performed_by,
      diff: params.diff ?? null,
    });

    if (error) console.warn('change_audit insert failed:', error.message);
  }

  async getUserRole(callerId: string, userId: string) {
    const { target } = await this.requireSelfOrAdminSameTeam(callerId, userId);
    return { user_id: target.user_id, team_id: target.team_id, role: target.role };
  }

  async setUserRole(callerId: string, userId: string, input: SetUserRoleInput) {
    const { caller, target } = await this.requireAdminSameTeam(callerId, userId);

    if (!this.isValidRole(input.role)) {
      throw new BadRequestException('Invalid role. Must be admin, staff, or manager.');
    }

    const oldRole = target.role;

    const { data, error } = await this.supabase
      .from('users') 
      .update({ role: input.role })
      .eq('user_id', userId)
      .select('user_id, team_id, role')
      .single();

    if (error) throw new InternalServerErrorException(error.message);

    await this.audit({
      entity_type: 'app_user',
      entity_id: userId,
      action: 'update',
      performed_by: caller.user_id,
      diff: { field: 'role', old: oldRole, new: input.role, reason: input.reason ?? null },
    });

    return { updated: data };
  }

  async getUserPermissions(callerId: string, userId: string) {
    const { target } = await this.requireSelfOrAdminSameTeam(callerId, userId);

    const role = target.role as Role;
    if (!this.isValidRole(role)) throw new BadRequestException('User has an unknown role value');

    return {
      user_id: target.user_id,
      team_id: target.team_id,
      role,
      permissions: this.rolePermissions[role] ?? [],
    };
  }

  async getAudit(callerId: string) {
    await this.requireAdmin(callerId);

    const { data, error } = await this.supabase
      .from('change_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new InternalServerErrorException(error.message);

    return { audit: data ?? [] };
  }
}