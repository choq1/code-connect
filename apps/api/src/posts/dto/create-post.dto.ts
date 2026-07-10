import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Título do post em duas linhas' })
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Uma breve descrição do que este post ensina.' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: "const hello = () => console.log('Hello world')" })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'javascript', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: ['React', 'Front-end'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiProperty({
    example: 'https://picsum.photos/seed/post-1/600/400',
    required: false,
    description:
      'Se omitido, o front exibe um placeholder no lugar da thumbnail',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
