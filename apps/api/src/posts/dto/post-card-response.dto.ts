import { ApiProperty } from '@nestjs/swagger';
import { AuthorResponseDto } from './author-response.dto';

export class PostCardResponseDto {
  @ApiProperty({ example: 'e3b0c442-98fc-1c14-9afb-f4c8996fb922' })
  id: string;

  @ApiProperty({ example: 'Título do post em duas linhas' })
  title: string;

  @ApiProperty({ example: 'Uma breve descrição do que este post ensina.' })
  description: string;

  @ApiProperty({ example: ['React', 'Front-end'] })
  tags: string[];

  @ApiProperty({
    example: 'https://picsum.photos/seed/post-1/600/400',
    nullable: true,
    description:
      'Nulo quando o post não tem thumbnail (o front exibe um placeholder)',
  })
  thumbnailUrl: string | null;

  @ApiProperty({ type: AuthorResponseDto })
  author: AuthorResponseDto;

  @ApiProperty({ example: 12 })
  likeCount: number;

  @ApiProperty({ example: 3 })
  commentCount: number;

  @ApiProperty({
    example: false,
    description: 'true se o usuário autenticado atual curtiu este post',
  })
  likedByMe: boolean;

  @ApiProperty({ example: '2026-06-01T12:00:00.000Z' })
  createdAt: Date;
}
