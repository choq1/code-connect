import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'code_connect'),
        autoLoadEntities: true,
        // O schema é versionado via migrations (src/database/migrations),
        // aplicadas automaticamente no boot. Nada de synchronize em runtime.
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/database/migrations/*.{ts,js}'],
      }),
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
})
export class AppModule {}
