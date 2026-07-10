import { ApiProperty } from '@nestjs/swagger';

export class AuthorResponseDto {
  @ApiProperty({ example: 'e3b0c442-98fc-1c14-9afb-f4c8996fb922' })
  id: string;

  @ApiProperty({ example: 'Júlio Lima' })
  name: string;

  @ApiProperty({ example: 'julio', nullable: true })
  username: string | null;

  @ApiProperty({ example: 'https://i.pravatar.cc/150?u=julio', nullable: true })
  avatarUrl: string | null;
}
