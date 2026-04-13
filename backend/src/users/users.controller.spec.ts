import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// ---------------------------------------------------------------------------
// Mock UsersService — controller tests only
// ---------------------------------------------------------------------------
const mockUsersService = {
    findAll: jest.fn(),
    updateRole: jest.fn(),
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('UsersController', () => {
    let controller: UsersController;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================================
    // GET /users — list()
    // =========================================================================
    describe('GET /users — list()', () => {
        it('returns ok:true with items from the service', async () => {
            const fakeUsers = [
                { user_id: 'u1', name: 'Alice', email: 'alice@ex.com', role: 'admin' },
                { user_id: 'u2', name: 'Bob',   email: 'bob@ex.com',   role: 'staff' },
            ];
            mockUsersService.findAll.mockResolvedValue(fakeUsers);

            const result = await controller.list();

            expect(result).toEqual({ ok: true, items: fakeUsers });
            expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
        });

        it('returns ok:true with empty array when no users exist', async () => {
            mockUsersService.findAll.mockResolvedValue([]);

            const result = await controller.list();

            expect(result).toEqual({ ok: true, items: [] });
        });

        it('propagates service errors', async () => {
            mockUsersService.findAll.mockRejectedValue(new Error('DB down'));

            await expect(controller.list()).rejects.toThrow('DB down');
        });
    });

    // =========================================================================
    // PATCH /users/:id/role — updateRole()
    // =========================================================================
    describe('PATCH /users/:id/role — updateRole()', () => {
        it('returns ok:true when a valid role is provided', async () => {
            mockUsersService.updateRole.mockResolvedValue(undefined);

            const result = await controller.updateRole('u1', 'manager');

            expect(result).toEqual({ ok: true });
            expect(mockUsersService.updateRole).toHaveBeenCalledWith('u1', 'manager');
        });

        it('accepts all three valid roles', async () => {
            mockUsersService.updateRole.mockResolvedValue(undefined);

            for (const role of ['admin', 'manager', 'staff']) {
                await expect(controller.updateRole('u1', role)).resolves.toEqual({ ok: true });
            }
            expect(mockUsersService.updateRole).toHaveBeenCalledTimes(3);
        });

        it('throws BadRequestException for an invalid role value', async () => {
            await expect(controller.updateRole('u1', 'superuser')).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException for titlecase role values (DB constraint values are lowercase)', async () => {
            await expect(controller.updateRole('u1', 'Administrator')).rejects.toThrow(BadRequestException);
            await expect(controller.updateRole('u1', 'Manager')).rejects.toThrow(BadRequestException);
            await expect(controller.updateRole('u1', 'User')).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when role is an empty string', async () => {
            await expect(controller.updateRole('u1', '')).rejects.toThrow(BadRequestException);
        });

        it('throws BadRequestException when role is undefined', async () => {
            await expect(controller.updateRole('u1', undefined as any)).rejects.toThrow(BadRequestException);
        });

        it('propagates service errors for a valid role', async () => {
            mockUsersService.updateRole.mockRejectedValue(new Error('constraint violation'));

            await expect(controller.updateRole('u1', 'admin')).rejects.toThrow('constraint violation');
        });
    });
});
