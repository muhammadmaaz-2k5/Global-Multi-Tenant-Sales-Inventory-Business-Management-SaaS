import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as Super Admin to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@shopflow.app', password: 'password123' });
    
    authToken = loginRes.body.access_token;
  });

  it('/admin/organizations (GET) - requires auth', () => {
    return request(app.getHttpServer())
      .get('/admin/organizations')
      .expect(401);
  });

  it('/admin/organizations (GET) - succeeds with token', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // Should have at least the TechStore NYC seed org
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/admin/organizations (POST) - creates new tenant', async () => {
    const uniqueEmail = `newowner_${Date.now()}@test.com`;
    const res = await request(app.getHttpServer())
      .post('/admin/organizations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        organizationName: `Test Organization ${Date.now()}`,
        ownerEmail: uniqueEmail,
        ownerPassword: 'securepassword123',
        ownerFirstName: 'John',
        ownerLastName: 'Doe'
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.orgId).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
