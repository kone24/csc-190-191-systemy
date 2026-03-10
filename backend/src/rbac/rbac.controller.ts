import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RbacService } from './rbac.service';
import { SetUserRoleDto } from './dto/set-user-role.dto';

type RequestWithUser = Request & {
  user?: { id?: string; sub?: string; email?: string };
};

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbac: RbacService) {}

  private callerId(req: RequestWithUser): string {
    const id = req.user?.id ?? req.user?.sub;
    if (!id) throw new Error('Missing req.user (JwtAuthGuard not applied?)');
    return id;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/role')
  getUserRole(@Req() req: RequestWithUser, @Param('userId') userId: string) {
    return this.rbac.getUserRole(this.callerId(req), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:userId/role')
  setUserRole(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Body() body: SetUserRoleDto,
  ) {
    return this.rbac.setUserRole(this.callerId(req), userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:userId/permissions')
  getUserPermissions(@Req() req: RequestWithUser, @Param('userId') userId: string) {
    return this.rbac.getUserPermissions(this.callerId(req), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('audit')
  getAudit(@Req() req: RequestWithUser) {
    return this.rbac.getAudit(this.callerId(req));
  }
}