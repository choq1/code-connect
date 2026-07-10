import 'dotenv/config';
import { DataSource } from 'typeorm';

// DataSource standalone usado pela TypeORM CLI (migration:generate/run/revert)
// e pelo script de seed. Não é o mesmo objeto usado pelo Nest em runtime
// (que é montado em app.module.ts via TypeOrmModule.forRootAsync), mas
// aponta para o mesmo banco e as mesmas entidades.
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'code_connect',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});

export default dataSource;
