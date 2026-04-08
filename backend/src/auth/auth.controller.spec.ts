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
  // POST /auth/login
  // =======================================================================
  describe('POST /auth/login', () => {
    it('should set cookie and return ok:true on valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Login successful',
        user: { username: 'admin' },
        token: 'jwt-token',
      });

      const res = fakeRes();
      const result = await controller.login(
        { username: 'admin', password: '1234' },
        res,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith('admin', '1234');
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        }),
      );
      expect(result).toEqual({ ok: true, user: { username: 'admin' } });
    });

    it('should return ok:false when credentials are invalid', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Invalid credentials',
      });

      const res = fakeRes();
      const result = await controller.login(
        { username: 'wrong', password: 'wrong' },
        res,
      );

      expect(res.cookie).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, message: 'Invalid credentials' });
    });

    it('should handle undefined body gracefully', async () => {
      mockAuthService.login.mockResolvedValue({
        message: 'Invalid credentials',
      });

      const res = fakeRes();
      const result = await controller.login(undefined as any, res);

      expect(result.ok).toBe(false);
    });
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
      });
      expect(result.ok).toBe(true);
      expect(result.redirect).toBe('/login');
    });
  });

  // =======================================================================
  // GET /auth/me
  // =======================================================================
  describe('GET /auth/me', () => {
    it('should return the user payload from request', () => {
      const req = fakeReq({ user: { username: 'admin' } });
      const result = controller.me(req);

      expect(result).toEqual({ username: 'admin' });
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
        'http://localhost:3000/dashboard',
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
