import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('creates a user and hashes the password', async () => {
    const result = await service.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'strongPassword123',
    });

    expect(result.name).toBe('Jane Doe');
    expect(result.email).toBe('jane@example.com');
    expect(result.id).toEqual(expect.any(String));

    const stored = service.findByEmail('jane@example.com');
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toBe('strongPassword123');
  });

  it('rejects duplicate emails', async () => {
    await service.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'strongPassword123',
    });

    await expect(
      service.create({
        name: 'Other Jane',
        email: 'jane@example.com',
        password: 'anotherPassword123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('finds a user by id', async () => {
    const created = await service.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'strongPassword123',
    });

    expect(service.findById(created.id)?.email).toBe('jane@example.com');
  });
});
