import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1738000000000 implements MigrationInterface {
  name = 'InitSchema1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "username" varchar UNIQUE,
        "avatarUrl" varchar,
        "passwordHash" varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "code" text NOT NULL,
        "language" varchar,
        "thumbnailUrl" varchar,
        "tags" text[] NOT NULL DEFAULT '{}',
        "authorId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_authorId" ON "posts" ("authorId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "body" text NOT NULL,
        "postId" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "authorId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "parentId" uuid REFERENCES "comments"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_postId" ON "comments" ("postId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_parentId" ON "comments" ("parentId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "postId" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_post_likes_post_user" UNIQUE ("postId", "userId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "post_likes"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
