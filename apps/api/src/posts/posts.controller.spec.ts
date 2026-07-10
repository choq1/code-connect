import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: Record<string, jest.Mock>;

  const jwtPayload = { sub: 'user-1', email: 'julio@codeconnect.dev' };

  beforeEach(async () => {
    postsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      like: jest.fn(),
      unlike: jest.fn(),
      getComments: jest.fn(),
      addComment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: postsService },
        AuthGuard,
        OptionalAuthGuard,
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn(), signAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('lists posts without requiring a logged-in user', async () => {
    postsService.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    await controller.findAll({ page: 1, limit: 9 }, undefined);

    expect(postsService.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 9 },
      undefined,
    );
  });

  it('passes the current user id when listing as a logged-in user', async () => {
    postsService.findAll.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 9,
    });

    await controller.findAll({}, jwtPayload);

    expect(postsService.findAll).toHaveBeenCalledWith({}, 'user-1');
  });

  it('delegates post creation to the service using the current user', async () => {
    const dto = { title: 'Post', description: 'Desc', code: 'code' };
    postsService.create.mockResolvedValue({ id: 'post-1' });

    await controller.create(dto, jwtPayload);

    expect(postsService.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('delegates likes to the service using the current user', async () => {
    postsService.like.mockResolvedValue({ likeCount: 1, likedByMe: true });

    await controller.like('post-1', jwtPayload);

    expect(postsService.like).toHaveBeenCalledWith('post-1', 'user-1');
  });

  it('delegates unlikes to the service using the current user', async () => {
    postsService.unlike.mockResolvedValue({ likeCount: 0, likedByMe: false });

    await controller.unlike('post-1', jwtPayload);

    expect(postsService.unlike).toHaveBeenCalledWith('post-1', 'user-1');
  });

  it('delegates comment creation to the service using the current user', async () => {
    const dto = { body: 'Comentário' };
    postsService.addComment.mockResolvedValue([]);

    await controller.addComment('post-1', dto, jwtPayload);

    expect(postsService.addComment).toHaveBeenCalledWith(
      'post-1',
      dto,
      'user-1',
    );
  });
});
