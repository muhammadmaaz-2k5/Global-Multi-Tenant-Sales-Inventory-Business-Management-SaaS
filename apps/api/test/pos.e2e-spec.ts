import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('POS & Orders (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let orgId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    // Log in to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@techstore.com', password: 'password123' });
    
    token = loginRes.body.access_token;

    // Get my profile to find orgId
    const profileRes = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    
    orgId = profileRes.body.memberships[0].organizationId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/organizations/:orgId/orders/checkout (POST) - fails without token', () => {
    return request(app.getHttpServer())
      .post(`/organizations/${orgId}/orders/checkout`)
      .send({})
      .expect(401);
  });

  it('/organizations/:orgId/orders/checkout (POST) - returns 400 on empty payload', () => {
    return request(app.getHttpServer())
      .post(`/organizations/${orgId}/orders/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({})
      .expect(400); // Validation error
  });
});
