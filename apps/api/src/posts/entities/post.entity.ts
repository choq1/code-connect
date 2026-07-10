import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { PostLike } from './post-like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'varchar', nullable: true })
  language: string | null;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  // Coluna gerada pelo Postgres (ver migration AddPostSearchVector). Nunca é
  // escrita pela aplicação — só usada para consultas de full-text search.
  @Column({
    type: 'tsvector',
    select: false,
    insert: false,
    update: false,
    nullable: true,
  })
  searchVector: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
