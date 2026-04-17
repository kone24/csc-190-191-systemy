import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

// ---------------------------------------------------------------------------
// Mock the Supabase client so no real network calls happen
// ---------------------------------------------------------------------------
const mockSupabaseFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

// ---------------------------------------------------------------------------
// Helper: mock global fetch (used by googleLogin)
// ---------------------------------------------------------------------------
const originalFetch = global.fetch;

function mockFetch(response: object, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => response,
  }) as any;
}

// ---------------------------------------------------------------------------
// Helpers to build Supabase query-builder chains
// ---------------------------------------------------------------------------
function supabaseSelectChain(data: any, error: any = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data, error }),
      }),
    }),
  };
}

function supabaseInsertChain(error: any = null) {
  return {
    insert: jest.fn().mockResolvedValue({ error }),
  };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    mockSupabaseFrom.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mocked-jwt-token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                SUPABASE_URL: 'https://mocked-supabase-url.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'mocked-service-role-key',
              };
              return map[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.DEV_ALLOWED_EMAILS;
  });

  // -----------------------------------------------------------------------
  // service instantiation
  // -----------------------------------------------------------------------
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =======================================================================
  // googleLogin() — Sign in with Google
  // =======================================================================
  describe('googleLogin()', () => {
    const VALID_EMAIL = 'jane@futureandsuns.com';

    // ----- token verification -----

    it('should fail when Google token verification fails', async () => {
      mockFetch({}, false);

      const result = await service.googleLogin('bad-token');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('Failed to verify Google ID token');
      }
    });

    it('should fail when Google token has no email', async () => {
      mockFetch({ aud: 'some-aud' }); // no email field

      const result = await service.googleLogin('token-no-email');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('No email found in Google token');
      }
    });

    // ----- domain restriction -----

    it('should reject emails outside @futureandsuns.com domain', async () => {
      mockFetch({ email: 'user@gmail.com' });

      const result = await service.googleLogin('some-token');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('restricted');
      }
    });

    // ----- dev allowlist -----

    it('should allow dev-allowlisted email even if domain does not match', async () => {
      process.env.DEV_ALLOWED_EMAILS = 'dev@gmail.com';
      mockFetch({ email: 'dev@gmail.com' });

      // User already exists
      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain({ email: 'dev@gmail.com' }),
      );

      const result = await service.googleLogin('dev-token');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.token).toBe('mocked-jwt-token');
        expect(result.user.email).toBe('dev@gmail.com');
      }
    });

    it('should handle comma-separated dev allowlist', async () => {
      process.env.DEV_ALLOWED_EMAILS = 'a@test.com, dev@gmail.com , b@test.com';
      mockFetch({ email: 'dev@gmail.com' });

      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain({ email: 'dev@gmail.com' }),
      );

      const result = await service.googleLogin('dev-token');

      expect(result.ok).toBe(true);
    });

    // ----- existing user flow -----

    it('should succeed for existing @futureandsuns.com user', async () => {
      mockFetch({ email: VALID_EMAIL });

      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain({ email: VALID_EMAIL }),
      );

      const result = await service.googleLogin('valid-token');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.token).toBe('mocked-jwt-token');
        expect(result.user.email).toBe(VALID_EMAIL);
        expect(jwtService.sign).toHaveBeenCalledWith(
          { username: VALID_EMAIL },
          { expiresIn: '20m' },
        );
      }
    });

    // ----- auto-provision flow -----

    it('should auto-provision new user when not found in DB', async () => {
      mockFetch({ email: VALID_EMAIL });

      // First call: select → user not found
      // Second call: insert → success
      let callCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return supabaseSelectChain(null);
        }
        return supabaseInsertChain(null);
      });

      const result = await service.googleLogin('new-user-token');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.email).toBe(VALID_EMAIL);
      }
    });

    it('should fail when auto-provision insert errors', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => { });
      mockFetch({ email: VALID_EMAIL });

      let callCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return supabaseSelectChain(null);
        }
        return supabaseInsertChain({ message: 'DB insert failed' });
      });

      const result = await service.googleLogin('new-user-token-fail');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toContain('Failed to create user account');
      }
    });
  });

  // =======================================================================
  // findUserByEmail()
  // =======================================================================
  describe('findUserByEmail()', () => {
    it('should return user when found', async () => {
      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain({ email: 'test@futureandsuns.com', name: 'Test' }),
      );

      const result = await service.findUserByEmail('Test@FutureAndSuns.com');

      expect(result.ok).toBe(true);
      expect(result.user).toEqual({ email: 'test@futureandsuns.com', name: 'Test' });
    });

    it('should return error when user not found', async () => {
      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain(null, { message: 'not found' }),
      );

      const result = await service.findUserByEmail('nobody@test.com');

      expect(result.ok).toBe(false);
      expect(result.message).toBe('User not found');
    });
  });

  // =======================================================================
  // findUserById()
  // =======================================================================
  describe('findUserById()', () => {
    it('should return user when found', async () => {
      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain({ user_id: 'uuid-123', name: 'Test' }),
      );

      const result = await service.findUserById('uuid-123');

      expect(result.ok).toBe(true);
      expect(result.user).toEqual({ user_id: 'uuid-123', name: 'Test' });
    });

    it('should return error when user not found', async () => {
      mockSupabaseFrom.mockReturnValue(
        supabaseSelectChain(null, { message: 'not found' }),
      );

      const result = await service.findUserById('bad-id');

      expect(result.ok).toBe(false);
    });
  });
});
