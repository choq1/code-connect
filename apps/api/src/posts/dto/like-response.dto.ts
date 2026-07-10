import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty({ example: 13 })
  likeCount: number;

  @ApiProperty({ example: true })
  likedByMe: boolean;
}
