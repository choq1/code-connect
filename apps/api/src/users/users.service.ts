import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('Email já cadastrado');
    }

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
    });

    await this.usersRepository.save(user);

    return this.toResponseDto(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  toResponseDto(user: User): UserResponseDto {
    return { id: user.id, name: user.name, email: user.email };
  }
}
