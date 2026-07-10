import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Achei muito bom seu código, parabéns!' })
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;

  @ApiProperty({
    required: false,
    description: 'Id do comentário pai, quando esta é uma resposta',
    example: 'e3b0c442-98fc-1c14-9afb-f4c8996fb922',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
