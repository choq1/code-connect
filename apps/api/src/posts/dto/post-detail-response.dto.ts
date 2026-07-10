import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';
import { PostCardResponseDto } from './post-card-response.dto';

export class PostDetailResponseDto extends PostCardResponseDto {
  @ApiProperty({ example: "const hello = () => console.log('Hello world')" })
  code: string;

  @ApiProperty({ example: 'javascript', nullable: true })
  language: string | null;

  @ApiProperty({ type: () => [CommentResponseDto] })
  comments: CommentResponseDto[];
}
