import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { OptionalAuthGuard } from './optional-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OptionalAuthGuard],
  // JwtModule é reexportado para que outros módulos (ex.: PostsModule) que
  // importam o AuthModule consigam instanciar AuthGuard/OptionalAuthGuard,
  // que dependem de JwtService.
  exports: [AuthService, AuthGuard, OptionalAuthGuard, JwtModule],
})
export class AuthModule {}
