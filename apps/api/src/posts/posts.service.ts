import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AuthorResponseDto } from './dto/author-response.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { LikeResponseDto } from './dto/like-response.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PaginatedPostsResponseDto } from './dto/paginated-posts-response.dto';
import { PostCardResponseDto } from './dto/post-card-response.dto';
import { PostDetailResponseDto } from './dto/post-detail-response.dto';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';

interface PostCountsRaw {
  commentCount?: string;
  likeCount?: string;
  likedByMeCount?: string;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly likesRepository: Repository<PostLike>,
  ) {}

  async findAll(
    query: ListPostsQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedPostsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 9;

    const baseQb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author');

    if (query.search) {
      baseQb.andWhere(
        `post."searchVector" @@ plainto_tsquery('portuguese', :search)`,
        { search: query.search },
      );
    }

    if (query.tag) {
      baseQb.andWhere(':tag = ANY(post.tags)', { tag: query.tag });
    }

    const total = await baseQb.clone().getCount();

    const qb = this.withCounts(baseQb.clone(), currentUserId)
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const { entities, raw } = await qb.getRawAndEntities<PostCountsRaw>();

    return {
      items: entities.map((post, index) => this.toCardDto(post, raw[index])),
      total,
      page,
      limit,
    };
  }

  async findOne(
    id: string,
    currentUserId?: string,
  ): Promise<PostDetailResponseDto> {
    const qb = this.withCounts(
      this.postsRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.id = :id', { id }),
      currentUserId,
    );

    const { entities, raw } = await qb.getRawAndEntities<PostCountsRaw>();
    const post = entities[0];

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    const comments = await this.getComments(id);

    return {
      ...this.toCardDto(post, raw[0]),
      code: post.code,
      language: post.language,
      comments,
    };
  }

  async create(
    dto: CreatePostDto,
    authorId: string,
  ): Promise<PostDetailResponseDto> {
    const post = this.postsRepository.create({
      title: dto.title,
      description: dto.description,
      code: dto.code,
      language: dto.language ?? null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      tags: dto.tags ?? [],
      authorId,
    });

    await this.postsRepository.save(post);

    return this.findOne(post.id, authorId);
  }

  async like(postId: string, userId: string): Promise<LikeResponseDto> {
    await this.ensurePostExists(postId);

    const existing = await this.likesRepository.findOneBy({ postId, userId });
    if (!existing) {
      await this.likesRepository.save(
        this.likesRepository.create({ postId, userId }),
      );
    }

    return this.getLikeStatus(postId, userId);
  }

  async unlike(postId: string, userId: string): Promise<LikeResponseDto> {
    await this.ensurePostExists(postId);

    await this.likesRepository.delete({ postId, userId });

    return this.getLikeStatus(postId, userId);
  }

  async getComments(postId: string): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepository.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });

    return this.buildCommentTree(comments);
  }

  async addComment(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentResponseDto[]> {
    await this.ensurePostExists(postId);

    if (dto.parentId) {
      const parent = await this.commentsRepository.findOneBy({
        id: dto.parentId,
        postId,
      });
      if (!parent) {
        throw new NotFoundException('Comentário pai não encontrado');
      }
    }

    const comment = this.commentsRepository.create({
      body: dto.body,
      postId,
      authorId,
      parentId: dto.parentId ?? null,
    });
    await this.commentsRepository.save(comment);

    return this.getComments(postId);
  }

  // Adiciona subconsultas de contagem (comentários, curtidas, e se o
  // usuário atual curtiu) a uma query de posts já filtrada. Usamos
  // subconsultas escalares em vez de joins para não duplicar linhas e para
  // evitar depender de helpers de contagem por relação (não disponíveis
  // nesta versão do driver).
  private withCounts(
    qb: ReturnType<Repository<Post>['createQueryBuilder']>,
    currentUserId?: string,
  ) {
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(*)')
          .from(Comment, 'c')
          .where('c."postId" = post.id'),
      'commentCount',
    ).addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(*)')
          .from(PostLike, 'l')
          .where('l."postId" = post.id'),
      'likeCount',
    );

    if (currentUserId) {
      qb.addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)')
            .from(PostLike, 'l2')
            .where('l2."postId" = post.id AND l2."userId" = :currentUserId'),
        'likedByMeCount',
      ).setParameter('currentUserId', currentUserId);
    }

    return qb;
  }

  private async ensurePostExists(postId: string): Promise<void> {
    const exists = await this.postsRepository.exists({
      where: { id: postId },
    });
    if (!exists) {
      throw new NotFoundException('Post não encontrado');
    }
  }

  private async getLikeStatus(
    postId: string,
    userId: string,
  ): Promise<LikeResponseDto> {
    const [likeCount, likedByMe] = await Promise.all([
      this.likesRepository.count({ where: { postId } }),
      this.likesRepository.exists({ where: { postId, userId } }),
    ]);

    return { likeCount, likedByMe };
  }

  private toCardDto(post: Post, raw: PostCountsRaw): PostCardResponseDto {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      tags: post.tags,
      thumbnailUrl: post.thumbnailUrl,
      author: this.toAuthorDto(post.author),
      likeCount: Number(raw.likeCount ?? 0),
      commentCount: Number(raw.commentCount ?? 0),
      likedByMe: Number(raw.likedByMeCount ?? 0) > 0,
      createdAt: post.createdAt,
    };
  }

  private toAuthorDto(user: User): AuthorResponseDto {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
    };
  }

  private buildCommentTree(comments: Comment[]): CommentResponseDto[] {
    const byId = new Map<string, CommentResponseDto>();
    const roots: CommentResponseDto[] = [];

    for (const comment of comments) {
      byId.set(comment.id, {
        id: comment.id,
        body: comment.body,
        author: this.toAuthorDto(comment.author),
        createdAt: comment.createdAt,
        replies: [],
      });
    }

    for (const comment of comments) {
      const dto = byId.get(comment.id);
      if (!dto) continue;

      const parent = comment.parentId ? byId.get(comment.parentId) : undefined;
      if (parent) {
        parent.replies.push(dto);
      } else {
        roots.push(dto);
      }
    }

    return roots;
  }
}
