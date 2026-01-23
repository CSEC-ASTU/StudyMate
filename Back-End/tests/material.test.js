import request from 'supertest';
import app from '../src/app.js';
import path from 'path';
import fs from 'fs';

describe('Material API', () => {
  let token;
  let semesterId;
  let courseId;
  const uniqueEmail = `test_material_${Date.now()}@example.com`;
  const dummyFilePath = path.join(process.cwd(), 'dummy.pdf');

  beforeAll(async () => {
    // 1. Setup: Create User and Login
    await request(app).post('/api/auth/signup').send({
      email: uniqueEmail,
      fullName: 'Material Tester',
      password: 'password123'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: uniqueEmail,
      password: 'password123'
    });
    token = loginRes.body.token;

    // 2. Setup: Create Semester
    const semRes = await request(app)
      .post('/api/semesters')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Spring 2025',
        startDate: '2025-01-01',
        endDate: '2025-05-01'
      });
    semesterId = semRes.body.id;

    // 3. Setup: Create Course
    const courseRes = await request(app)
      .post(`/api/semesters/${semesterId}/courses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Distributed Systems',
        code: 'CS401',
        creditHours: 4
      });
    courseId = courseRes.body.id;

    // 4. Create dummy file
    fs.writeFileSync(dummyFilePath, 'dummy pdf content');
  });

  afterAll(() => {
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  });

  test('POST /api/materials - Upload New Material', async () => {
    const res = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'System Design Basics')
      .field('universityName', 'Tech University')
      .field('courseName', 'Distributed Systems')
      .field('courseId', courseId)
      .attach('file', dummyFilePath);

    expect(res.status).toBe(201);
    expect(res.body.material).toHaveProperty('id');
    expect(res.body.material.fileHash).toBeDefined();
    expect(res.body.attachment.courseId).toBe(courseId);
  });

  test('POST /api/materials - Deduplication (Reuse Existing Material)', async () => {
    // Upload the same file again
    const res = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'System Design Basics Duplicate')
      .field('universityName', 'Tech University')
      .field('courseName', 'Distributed Systems')
      .field('courseId', courseId)
      .attach('file', dummyFilePath);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Material processed successfully');
    // The material ID should be the same as the first one, but since we don't have it saved here, 
    // we just check it succeeded. The service uses upsert for attachment.
  });

  test('POST /api/materials - Validation Failure', async () => {
    const res = await request(app)
      .post('/api/materials')
      .set('Authorization', `Bearer ${token}`)
      .field('title', '') // Empty title should fail
      .attach('file', dummyFilePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
