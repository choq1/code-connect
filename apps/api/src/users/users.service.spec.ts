import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let users: User[];

  beforeEach(async () => {
    users = [];

    const repositoryMock = {
      create: jest.fn(
        (data: Partial<User>) =>
          ({ id: `${users.length + 1}`, ...data }) as User,
      ),
      save: jest.fn((user: User) => {
        users.push(user);
        return Promise.resolve(user);
      }),
      findOneBy: jest.fn(({ email, id }: { email?: string; id?: string }) => {
        const found = users.find(
          (user) => (email && user.email === email) || (id && user.id === id),
        );
        return Promise.resolve(found ?? null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repositoryMock },
      ],
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

    const stored = await service.findByEmail('jane@example.com');
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

    const found = await service.findById(created.id);
    expect(found?.email).toBe('jane@example.com');
  });
});
