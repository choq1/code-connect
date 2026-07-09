import { Test, TestingModule } from '@nestjs/testing';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { create: jest.Mock };

  beforeEach(async () => {
    usersService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates user creation to UsersService', async () => {
    const dto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'strongPassword123',
    };
    const response: UserResponseDto = {
      id: '1',
      name: dto.name,
      email: dto.email,
    };
    usersService.create.mockResolvedValue(response);

    await expect(controller.create(dto)).resolves.toEqual(response);
    expect(usersService.create).toHaveBeenCalledWith(dto);
  });
});
