import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Request, Response as ExpressResponse } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    googleLogin: jest.Mock;
  };

  const originalEnv = process.env;

  const makeRes = () => {
    return {
      cookie: jest.fn(),
      redirect: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as ExpressResponse;
  };

  beforeEach(async () => {
    authService = {
      googleLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:4000/auth/google/callback',
      GOOGLE_SCOPES:
        'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/contacts.readonly',
      NODE_ENV: 'test',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets oauth_error cookie and redirects to login when required scopes are missing', async () => {
    const req = {
      query: {
        code: 'oauth-code',
      },
    } as unknown as Request;
    const res = makeRes();

    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        id_token: 'id-token',
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
      }),
    } as unknown as globalThis.Response);

    await controller.googleCallback(req, res);

    expect(authService.googleLogin).not.toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith(
      'oauth_error',
      'Please grant Contacts access to continue.',
      expect.objectContaining({ httpOnly: false, maxAge: 30000, path: '/' }),
    );
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000/login');
  });

  it('logs in and redirects to dashboard when all required scopes are granted', async () => {
    const req = {
      query: {
        code: 'oauth-code',
      },
    } as unknown as Request;
    const res = makeRes();

    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        id_token: 'id-token',
        scope:
          'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/contacts.readonly',
      }),
    } as unknown as globalThis.Response);

    authService.googleLogin.mockResolvedValue({
      ok: true,
      token: 'jwt-token',
    });

    await controller.googleCallback(req, res);

    expect(authService.googleLogin).toHaveBeenCalledWith('id-token');
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 20,
        path: '/',
      }),
    );
    expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000/dashboard');
  });
});
