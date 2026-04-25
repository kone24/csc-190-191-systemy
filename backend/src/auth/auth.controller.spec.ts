import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// ---------------------------------------------------------------------------
// Mock AuthService — we only test the controller layer here
// ---------------------------------------------------------------------------
const mockAuthService = {
  login: jest.fn(),
  googleLogin: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
};

// ---------------------------------------------------------------------------
// Helpers for fake Express objects
// ---------------------------------------------------------------------------
function fakeRes() {
  const res: any = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  };
  return res;
}

function fakeReq(overrides: Record<string, any> = {}) {
  return { user: undefined, query: {}, cookies: {}, ...overrides } as any;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =======================================================================
  // POST /auth/logout
  // =======================================================================
  describe('POST /auth/logout', () => {
    it('should clear cookie and return success', () => {
      const res = fakeRes();
      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token', {
        path: '/',
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      expect(res.clearCookie).toHaveBeenCalledWith('csrf_token', {
        path: '/',
        sameSite: 'none',
        secure: true,
      });
      expect(result.ok).toBe(true);
      expect(result.redirect).toBe('/login');
    });
  });

  // =======================================================================
  // GET /auth/me
  // =======================================================================
  describe('GET /auth/me', () => {
    it('should look up full user profile by email from JWT', async () => {
      const req = fakeReq({ user: { username: 'admin@futureandsuns.com' } });
      mockAuthService.findUserByEmail.mockResolvedValue({
        ok: true,
        user: { user_id: 'uuid-123', name: 'Admin', email: 'admin@futureandsuns.com', role: 'admin' },
      });

      const res = { setHeader: jest.fn() } as any;
      const result = await controller.me(req, res);

      expect(mockAuthService.findUserByEmail).toHaveBeenCalledWith('admin@futureandsuns.com');
      expect(result).toEqual({
        ok: true,
        user: { user_id: 'uuid-123', name: 'Admin', email: 'admin@futureandsuns.com', role: 'admin' },
      });
    });

    it('should return error when JWT payload has no username', async () => {
      const req = fakeReq({ user: {} });
      const res = { setHeader: jest.fn() } as any;
      const result = await controller.me(req, res);
      expect(result).toEqual({ ok: false, message: 'Invalid token payload' });
    });
  });

  // =======================================================================
  // GET /auth/google/callback  (Google sign-in flow)
  // =======================================================================
  describe('GET /auth/google/callback', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should redirect to /login?error=oauth when no code provided', async () => {
      const req = fakeReq({ query: {} });
      const res = fakeRes();

      await controller.googleCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=oauth',
      );
    });

    it('should redirect to /login?error=oauth when token exchange fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({}), // no id_token
      }) as any;

      const req = fakeReq({ query: { code: 'auth-code' } });
      const res = fakeRes();

      await controller.googleCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=oauth',
      );
    });

    it('should redirect to /login?error=domain when domain is restricted', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ id_token: 'google-id-token' }),
      }) as any;

      mockAuthService.googleLogin.mockResolvedValue({
        ok: false,
        message: 'Access restricted to @futureandsuns.com accounts',
      });

      const req = fakeReq({ query: { code: 'auth-code' } });
      const res = fakeRes();

      await controller.googleCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?error=domain',
      );
    });

    it('should set cookie and redirect to /dashboard on success', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: async () => ({ id_token: 'google-id-token' }),
      }) as any;

      mockAuthService.googleLogin.mockResolvedValue({
        ok: true,
        token: 'jwt-from-google',
        user: { email: 'jane@futureandsuns.com' },
      });

      const req = fakeReq({ query: { code: 'auth-code' } });
      const res = fakeRes();

      await controller.googleCallback(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-from-google',
        expect.objectContaining({ httpOnly: true, path: '/' }),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/AuthCallback#token=jwt-from-google',
      );
    });
  });

  // =======================================================================
  // GET /auth/find-user
  // =======================================================================
  describe('GET /auth/find-user', () => {
    it('should call findUserByEmail when email provided', async () => {
      mockAuthService.findUserByEmail.mockResolvedValue({
        ok: true,
        user: { email: 'a@b.com' },
      });

      const result = await controller.findUser('a@b.com', undefined);

      expect(mockAuthService.findUserByEmail).toHaveBeenCalledWith('a@b.com');
      expect(result.ok).toBe(true);
    });

    it('should call findUserById when id provided', async () => {
      mockAuthService.findUserById.mockResolvedValue({
        ok: true,
        user: { user_id: 'uuid' },
      });

      const result = await controller.findUser(undefined, 'uuid');

      expect(mockAuthService.findUserById).toHaveBeenCalledWith('uuid');
    });

    it('should return error when neither email nor id provided', async () => {
      const result = await controller.findUser(undefined, undefined);

      expect(result.ok).toBe(false);
      expect(result.message).toContain('Provide');
    });
  });
});
