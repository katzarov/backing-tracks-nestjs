import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { AuthTestGuard } from './utils/auth-test.guard';

describe('App (e2e) smoke', () => {
  describe('guards - auth', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('returns 401 when user not authenticated', () => {
      return request(app.getHttpServer()).get('/playlists').expect(401);
    });

    it('returns 404 when route not exist', () => {
      return request(app.getHttpServer())
        .get('/we-dont-have-this-route')
        .expect(404);
    });

    afterAll(async () => await app.close());
  });

  describe('dto validation', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(AuthGuard)
        .useClass(AuthTestGuard)
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('nestjs-zod validation works (negative)', () => {
      const notYoutubeUrl = encodeURIComponent(
        'https://www.notyoutube.com/watch?v=STQjp-U-Y84',
      );
      return request(app.getHttpServer())
        .get(`/acquire-tracks/youtube/info/${notYoutubeUrl}`)
        .expect(400)
        .expect(
          '{"statusCode":400,"message":"Validation failed","errors":[{"code":"custom","message":"Not a valid YouTube URL","path":["url"]}]}',
        );
    });

    it.todo('nestjs-zod validation works (positive)');

    it.todo('class-validator validation works (negative)');

    it.todo('class-validator validation works (positive)');

    afterAll(async () => await app.close());
  });

  it.todo('nestjs-zod interceptor response validator works');
});
