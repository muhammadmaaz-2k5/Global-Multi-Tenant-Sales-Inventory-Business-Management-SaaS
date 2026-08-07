import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - fails with bad credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong' })
      .expect(401);
  });

  it('/auth/login (POST) - succeeds with valid credentials', async () => {
    // Relying on the seed data we just inserted (admin@shopflow.app / password123)
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@shopflow.app', password: 'password123' })
      .expect(200);

    expect(response.body.access_token).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
