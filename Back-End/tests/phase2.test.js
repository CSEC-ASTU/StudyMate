import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Test Data
const testUser = {
  email: 'test_phase2@example.com',
  password: 'password123',
  fullName: 'Test User Phase2'
};

let token;
let userId;
let semesterId;
let courseId;

describe('Phase 2: Assessments & Analysis', () => {
  beforeAll(async () => {
    // Cleanup
    await prisma.assessment.deleteMany();
    await prisma.courseProgress.deleteMany();
    await prisma.course.deleteMany();
    await prisma.semesterAnalysis.deleteMany();
    await prisma.semester.deleteMany();
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Create User
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash: hashedPassword,
        fullName: testUser.fullName
      }
    });
    userId = user.id;

    // Login (Get Token)
    token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create Semester
    const semester = await prisma.semester.create({
      data: {
        userId,
        name: 'Spring 2026',
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 90))
      }
    });
    semesterId = semester.id;

    // Create Course
    const course = await prisma.course.create({
      data: {
        userId,
        semesterId,
        name: 'Advanced Backend',
        code: 'CS404'
      }
    });
    courseId = course.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Assessments', () => {
    it('should create a quiz assessment', async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/assessments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'quiz',
          title: 'Unit Test 1',
          mark: 8,
          maxMark: 10
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Unit Test 1');
      expect(res.body.mark).toBe(8);
    });

    it('should trigger course progress recalculation', async () => {
      // Check progress immediately after adding assessment
      const res = await request(app)
        .get(`/api/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.averageMark).toBe(80); // 8/10 * 100
      expect(res.body.quizzesTaken).toBe(1);
    });

    it('should create an exam assessment', async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/assessments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'exam',
          title: 'Midterm',
          mark: 45,
          maxMark: 50
        });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('Course Progress', () => {
    it('should show updated progress stats', async () => {
      const res = await request(app)
        .get(`/api/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      // Total Marks: 8 + 45 = 53
      // Total Max: 10 + 50 = 60
      // Avg: (53 / 60) * 100 = 88.333...
      expect(res.body.averageMark).toBeCloseTo(88.33, 1);
      expect(res.body.quizzesTaken).toBe(1);
      expect(res.body.examsTaken).toBe(1);
      expect(res.body.testsTaken).toBe(0);
    });
  });

  describe('Semester Analysis', () => {
    it('should generate semester analysis', async () => {
      const res = await request(app)
        .get(`/api/semesters/${semesterId}/analysis`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.totalCourses).toBe(1);
      expect(res.body.averageMark).toBeCloseTo(88.33, 1);
    });
  });

  describe('Ownership & Security', () => {
    it('should not allow adding assessment to another users course', async () => {
        // Mock another user
        const otherUserToken = jwt.sign({ id: 'some-other-uuid', email: 'hacker@test.com' }, process.env.JWT_SECRET || 'secret');
        
        const res = await request(app)
            .post(`/api/courses/${courseId}/assessments`)
            .set('Authorization', `Bearer ${otherUserToken}`)
            .send({
                type: 'quiz',
                title: 'Hacked Quiz',
                mark: 10,
                maxMark: 10
            });
            
        expect(res.statusCode).toBe(403);
    });
  });
});
