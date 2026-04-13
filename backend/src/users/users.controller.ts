import { Controller, Get, Patch, Param, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const VALID_ROLES = ['admin', 'staff', 'manager'] as const;

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles('admin')
    async list() {
        const items = await this.usersService.findAll();
        return { ok: true, items };
    }

    @Patch(':id/role')
    @Roles('admin')
    async updateRole(@Param('id') id: string, @Body('role') role: string) {
        if (!role || !VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
            throw new BadRequestException(`Role must be one of: ${VALID_ROLES.join(', ')}`);
        }
        await this.usersService.updateRole(id, role);
        return { ok: true };
    }
}
