import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let authService: jest.Mocked<AuthService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(() => {
        configService = {
            get: jest.fn((key: string) => {
                if (key === 'JWT_SECRET') return 'test-secret';
                return undefined;
            }),
        } as unknown as jest.Mocked<ConfigService>;

        authService = {
            findUserByEmail: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        strategy = new JwtStrategy(configService, authService);
    });

    // =========================================================================
    // validate()
    // =========================================================================

    it('returns null when payload has no username', async () => {
        const result = await strategy.validate({ sub: 'user-1' });
        expect(result).toBeNull();
        expect(authService.findUserByEmail).not.toHaveBeenCalled();
    });

    it('returns null when payload.username is empty string', async () => {
        const result = await strategy.validate({ username: '' });
        expect(result).toBeNull();
    });

    it('returns null when findUserByEmail returns { ok: false }', async () => {
        authService.findUserByEmail.mockResolvedValue({ ok: false } as any);
        const result = await strategy.validate({ username: 'user@example.com' });
        expect(result).toBeNull();
    });

    it('returns payload when user exists in DB', async () => {
        authService.findUserByEmail.mockResolvedValue({ ok: true, user: { id: '1' } } as any);
        const payload = { username: 'user@example.com', sub: 'user-1' };
        const result = await strategy.validate(payload);
        expect(result).toBe(payload);
    });

    it('calls findUserByEmail with the payload username', async () => {
        authService.findUserByEmail.mockResolvedValue({ ok: true } as any);
        await strategy.validate({ username: 'test@futureandsuns.com' });
        expect(authService.findUserByEmail).toHaveBeenCalledWith('test@futureandsuns.com');
    });
});
