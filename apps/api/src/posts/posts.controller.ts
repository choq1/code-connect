import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts-response.dto';
import { PostDetailResponseDto } from './dto/post-detail-response.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOkResponse({
    description: 'Lista paginada de posts (busca full-text via ?search=)',
    type: PaginatedPostsResponseDto,
  })
  findAll(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.findAll(query, user?.sub);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOkResponse({
    description: 'Detalhes do post',
    type: PostDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user?: JwtPayload,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.findOne(id, user?.sub);
  }

  @Get(':id/comments')
  @UseGuards(OptionalAuthGuard)
  @ApiOkResponse({
    description: 'Árvore de comentários do post',
    type: [CommentResponseDto],
  })
  getComments(@Param('id') id: string): Promise<CommentResponseDto[]> {
    return this.postsService.getComments(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Post criado',
    type: PostDetailResponseDto,
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.create(createPostDto, user.sub);
  }

  @Post(':id/likes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Post curtido', type: LikeResponseDto })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  like(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeResponseDto> {
    return this.postsService.like(id, user.sub);
  }

  @Delete(':id/likes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Curtida removida', type: LikeResponseDto })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  unlike(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeResponseDto> {
    return this.postsService.unlike(id, user.sub);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description:
      'Comentário criado — retorna a árvore de comentários atualizada',
    type: [CommentResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Post ou comentário pai não encontrado',
  })
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CommentResponseDto[]> {
    return this.postsService.addComment(id, createCommentDto, user.sub);
  }
}
