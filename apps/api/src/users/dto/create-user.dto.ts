import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Nome completo do usuário' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    minLength: 6,
    description: 'Senha do usuário',
  })
  @MinLength(6)
  password: string;
}
