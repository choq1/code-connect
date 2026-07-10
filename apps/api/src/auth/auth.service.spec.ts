import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn() };
    jwtService = { signAsync: jest.fn().mockResolvedValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns an access token for valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'jane@example.com',
      passwordHash: await bcrypt.hash('strongPassword123', 10),
    });

    const result = await service.signIn(
      'jane@example.com',
      'strongPassword123',
    );

    expect(result).toEqual({ access_token: 'signed-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '1',
      email: 'jane@example.com',
    });
  });

  it('throws UnauthorizedException for an unknown email', async () => {
    usersService.findByEmail.mockResolvedValue(undefined);

    await expect(
      service.signIn('unknown@example.com', 'anyPassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for a wrong password', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'jane@example.com',
      passwordHash: await bcrypt.hash('strongPassword123', 10),
    });

    await expect(
      service.signIn('jane@example.com', 'wrongPassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
