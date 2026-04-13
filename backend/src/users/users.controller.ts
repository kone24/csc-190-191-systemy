import { Controller, Get, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';

const VALID_ROLES = ['admin', 'staff', 'manager'] as const;

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async list() {
        const items = await this.usersService.findAll();
        return { ok: true, items };
    }

    @Patch(':id/role')
    async updateRole(@Param('id') id: string, @Body('role') role: string) {
        if (!role || !VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
            throw new BadRequestException(`Role must be one of: ${VALID_ROLES.join(', ')}`);
        }
        await this.usersService.updateRole(id, role);
        return { ok: true };
    }
}
