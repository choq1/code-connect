import { ApiProperty } from '@nestjs/swagger';
import { PostCardResponseDto } from './post-card-response.dto';

export class PaginatedPostsResponseDto {
  @ApiProperty({ type: () => [PostCardResponseDto] })
  items: PostCardResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 9 })
  limit: number;
}
