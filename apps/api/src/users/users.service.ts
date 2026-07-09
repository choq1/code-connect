import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (this.findByEmail(dto.email)) {
      throw new ConflictException('Email já cadastrado');
    }

    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, SALT_ROUNDS),
    };

    this.users.push(user);

    return this.toResponseDto(user);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  toResponseDto(user: User): UserResponseDto {
    return { id: user.id, name: user.name, email: user.email };
  }
}
