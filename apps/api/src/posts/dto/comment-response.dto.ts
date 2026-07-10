import { ApiProperty } from '@nestjs/swagger';
import { AuthorResponseDto } from './author-response.dto';

export class CommentResponseDto {
  @ApiProperty({ example: 'e3b0c442-98fc-1c14-9afb-f4c8996fb922' })
  id: string;

  @ApiProperty({ example: 'Achei muito bom seu código, parabéns!' })
  body: string;

  @ApiProperty({ type: AuthorResponseDto })
  author: AuthorResponseDto;

  @ApiProperty({ example: '2026-06-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: () => [CommentResponseDto] })
  replies: CommentResponseDto[];
}
