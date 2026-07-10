import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';

function createQueryBuilderMock(result: {
  entities: unknown[];
  raw: unknown[];
  total?: number;
}) {
  const qb: Record<string, jest.Mock> = {};
  const chain = () => qb;

  qb.leftJoinAndSelect = jest.fn(chain);
  qb.where = jest.fn(chain);
  qb.andWhere = jest.fn(chain);
  qb.addSelect = jest.fn(chain);
  qb.setParameter = jest.fn(chain);
  qb.orderBy = jest.fn(chain);
  qb.skip = jest.fn(chain);
  qb.take = jest.fn(chain);
  qb.clone = jest.fn(chain);
  qb.getCount = jest.fn().mockResolvedValue(result.total ?? 0);
  qb.getRawAndEntities = jest.fn().mockResolvedValue({
    entities: result.entities,
    raw: result.raw,
  });

  return qb;
}

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: Record<string, jest.Mock>;
  let commentsRepository: Record<string, jest.Mock>;
  let likesRepository: Record<string, jest.Mock>;

  const author = {
    id: 'user-1',
    name: 'Júlio Lima',
    username: 'julio',
    avatarUrl: null,
  };

  beforeEach(async () => {
    postsRepository = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((data: unknown) => data),
      save: jest.fn((data: unknown) => Promise.resolve(data)),
      exists: jest.fn(),
    };
    commentsRepository = {
      create: jest.fn((data: unknown) => data),
      save: jest.fn((data: unknown) => Promise.resolve(data)),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };
    likesRepository = {
      create: jest.fn((data: unknown) => data),
      save: jest.fn((data: unknown) => Promise.resolve(data)),
      delete: jest.fn(),
      findOneBy: jest.fn(),
      count: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postsRepository },
        {
          provide: getRepositoryToken(Comment),
          useValue: commentsRepository,
        },
        { provide: getRepositoryToken(PostLike), useValue: likesRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('findAll', () => {
    it('maps posts and counts into card DTOs', async () => {
      const post = {
        id: 'post-1',
        title: 'Título',
        description: 'Descrição',
        tags: ['React'],
        thumbnailUrl: null,
        author,
        createdAt: new Date('2026-01-01'),
      };
      const qb = createQueryBuilderMock({
        entities: [post],
        raw: [{ commentCount: '2', likeCount: '5', likedByMeCount: '1' }],
        total: 1,
      });
      postsRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ page: 1, limit: 9 }, 'user-1');

      expect(result.total).toBe(1);
      expect(result.items).toEqual([
        {
          id: 'post-1',
          title: 'Título',
          description: 'Descrição',
          tags: ['React'],
          thumbnailUrl: null,
          author: {
            id: 'user-1',
            name: 'Júlio Lima',
            username: 'julio',
            avatarUrl: null,
          },
          likeCount: 5,
          commentCount: 2,
          likedByMe: true,
          createdAt: post.createdAt,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the post does not exist', async () => {
      const qb = createQueryBuilderMock({ entities: [], raw: [] });
      postsRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the post detail including comments and counts', async () => {
      const post = {
        id: 'post-1',
        title: 'Título',
        description: 'Descrição',
        tags: [],
        thumbnailUrl: null,
        author,
        code: 'console.log(1)',
        language: 'javascript',
        createdAt: new Date('2026-01-01'),
      };
      const qb = createQueryBuilderMock({
        entities: [post],
        raw: [{ commentCount: '0', likeCount: '0' }],
      });
      postsRepository.createQueryBuilder.mockReturnValue(qb);
      commentsRepository.find.mockResolvedValue([]);

      const result = await service.findOne('post-1');

      expect(result.code).toBe('console.log(1)');
      expect(result.comments).toEqual([]);
      expect(result.likedByMe).toBe(false);
    });
  });

  describe('like/unlike', () => {
    it('throws NotFoundException when the post does not exist', async () => {
      postsRepository.exists.mockResolvedValue(false);

      await expect(service.like('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('creates a like when none exists yet', async () => {
      postsRepository.exists.mockResolvedValue(true);
      likesRepository.findOneBy.mockResolvedValue(null);
      likesRepository.count.mockResolvedValue(1);
      likesRepository.exists.mockResolvedValue(true);

      const result = await service.like('post-1', 'user-1');

      expect(likesRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ likeCount: 1, likedByMe: true });
    });

    it('is idempotent when the like already exists', async () => {
      postsRepository.exists.mockResolvedValue(true);
      likesRepository.findOneBy.mockResolvedValue({ id: 'like-1' });
      likesRepository.count.mockResolvedValue(1);
      likesRepository.exists.mockResolvedValue(true);

      await service.like('post-1', 'user-1');

      expect(likesRepository.save).not.toHaveBeenCalled();
    });

    it('removes a like on unlike', async () => {
      postsRepository.exists.mockResolvedValue(true);
      likesRepository.count.mockResolvedValue(0);
      likesRepository.exists.mockResolvedValue(false);

      const result = await service.unlike('post-1', 'user-1');

      expect(likesRepository.delete).toHaveBeenCalledWith({
        postId: 'post-1',
        userId: 'user-1',
      });
      expect(result).toEqual({ likeCount: 0, likedByMe: false });
    });
  });

  describe('comments', () => {
    it('builds a nested tree from a flat list', async () => {
      commentsRepository.find.mockResolvedValue([
        {
          id: 'c1',
          body: 'raiz',
          author,
          createdAt: new Date('2026-01-01'),
          parentId: null,
        },
        {
          id: 'c2',
          body: 'resposta',
          author,
          createdAt: new Date('2026-01-02'),
          parentId: 'c1',
        },
      ]);

      const result = await service.getComments('post-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
      expect(result[0].replies).toHaveLength(1);
      expect(result[0].replies[0].id).toBe('c2');
    });

    it('throws NotFoundException when the post does not exist', async () => {
      postsRepository.exists.mockResolvedValue(false);

      await expect(
        service.addComment('missing', { body: 'oi' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the parent comment does not exist', async () => {
      postsRepository.exists.mockResolvedValue(true);
      commentsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.addComment(
          'post-1',
          { body: 'oi', parentId: 'missing' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('creates a comment and returns the refreshed tree', async () => {
      postsRepository.exists.mockResolvedValue(true);
      commentsRepository.find.mockResolvedValue([
        {
          id: 'c1',
          body: 'novo comentário',
          author,
          createdAt: new Date('2026-01-01'),
          parentId: null,
        },
      ]);

      const result = await service.addComment(
        'post-1',
        { body: 'novo comentário' },
        'user-1',
      );

      expect(commentsRepository.save).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].body).toBe('novo comentário');
    });
  });

  describe('create', () => {
    it('creates a post and returns it via findOne', async () => {
      const post = {
        id: 'post-1',
        title: 'Novo post',
        description: 'Descrição',
        tags: [],
        thumbnailUrl: null,
        author,
        code: 'code',
        language: null,
        createdAt: new Date('2026-01-01'),
      };
      const qb = createQueryBuilderMock({
        entities: [post],
        raw: [{ commentCount: '0', likeCount: '0' }],
      });
      postsRepository.createQueryBuilder.mockReturnValue(qb);
      commentsRepository.find.mockResolvedValue([]);

      const result = await service.create(
        { title: 'Novo post', description: 'Descrição', code: 'code' },
        'user-1',
      );

      expect(postsRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Novo post');
    });
  });
});
