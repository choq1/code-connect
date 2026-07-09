import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth flow (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it('registers, logs in and fetches the logged-in user', async () => {
    const credentials = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'strongPassword123',
    };

    interface UserResponseBody {
      id: string;
      name: string;
      email: string;
    }
    interface AuthResponseBody {
      access_token: string;
    }

    await request(app.getHttpServer())
      .post('/users')
      .send(credentials)
      .expect(201)
      .expect((res) => {
        const body = res.body as UserResponseBody;
        expect(body.id).toEqual(expect.any(String));
        expect(body.name).toBe(credentials.name);
        expect(body.email).toBe(credentials.email);
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const loginBody = loginResponse.body as AuthResponseBody;
    expect(loginBody.access_token).toEqual(expect.any(String));

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.access_token}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as UserResponseBody;
        expect(body.id).toEqual(expect.any(String));
        expect(body.name).toBe(credentials.name);
        expect(body.email).toBe(credentials.email);
      });
  });

  it('rejects /auth/me without a token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
