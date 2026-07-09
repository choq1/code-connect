import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { signIn: jest.Mock };
  let usersService: { findById: jest.Mock; toResponseDto: jest.Mock };

  beforeEach(async () => {
    authService = { signIn: jest.fn() };
    usersService = { findById: jest.fn(), toResponseDto: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        AuthGuard,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn(), signAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates login to AuthService', async () => {
    const dto = { email: 'jane@example.com', password: 'strongPassword123' };
    authService.signIn.mockResolvedValue({ access_token: 'token' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'token',
    });
    expect(authService.signIn).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('returns the logged-in user data', () => {
    const user = {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      passwordHash: 'hash',
    };
    const responseDto = {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
    };
    usersService.findById.mockReturnValue(user);
    usersService.toResponseDto.mockReturnValue(responseDto);

    const request = {
      user: { sub: '1', email: 'jane@example.com' },
    } as unknown as Request;

    expect(controller.me(request)).toEqual(responseDto);
    expect(usersService.findById).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the user no longer exists', () => {
    usersService.findById.mockReturnValue(undefined);

    const request = {
      user: { sub: '1', email: 'jane@example.com' },
    } as unknown as Request;

    expect(() => controller.me(request)).toThrow(NotFoundException);
  });
});
