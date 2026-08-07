import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Inventory (e2e)', () => {
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

  it('/organizations/:orgId/inventory (GET) - fails without token', () => {
    return request(app.getHttpServer())
      .get(`/organizations/${orgId}/inventory`)
      .expect(401);
  });

  it('/organizations/:orgId/inventory (GET) - returns inventory levels for org', async () => {
    const res = await request(app.getHttpServer())
      .get(`/organizations/${orgId}/inventory`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/organizations/:orgId/inventory/adjust (POST) - fails with bad payload', () => {
    return request(app.getHttpServer())
      .post(`/organizations/${orgId}/inventory/adjust`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({ locationId: 'wrong', quantity: 5 }) // Missing variantId
      .expect(400); // Validation error
  });
});
