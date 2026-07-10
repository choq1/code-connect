import { MigrationInterface, QueryRunner } from 'typeorm';

// Full-text search sobre título, descrição e tags. Usamos uma coluna gerada
// (STORED) para que o índice GIN acompanhe automaticamente qualquer update,
// sem exigir que a aplicação mantenha o tsvector manualmente.
//
// to_tsvector(regconfig, text) é marcada STABLE (não IMMUTABLE) no catálogo
// do Postgres, então não pode ser usada direto numa coluna gerada. O
// contorno padrão é envolvê-la numa função SQL declarada IMMUTABLE.
export class AddPostSearchVector1738000000001 implements MigrationInterface {
  name = 'AddPostSearchVector1738000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION post_search_vector(title text, description text, tags text[])
      RETURNS tsvector AS $$
        SELECT to_tsvector(
          'pg_catalog.portuguese'::regconfig,
          coalesce(title, '') || ' ' ||
          coalesce(description, '') || ' ' ||
          array_to_string(tags, ' ')
        )
      $$ LANGUAGE sql IMMUTABLE
    `);

    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD COLUMN "searchVector" tsvector
      GENERATED ALWAYS AS (post_search_vector("title", "description", "tags")) STORED
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_posts_searchVector" ON "posts" USING GIN ("searchVector")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_posts_searchVector"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "searchVector"`);
    await queryRunner.query(
      `DROP FUNCTION post_search_vector(text, text, text[])`,
    );
  }
}
