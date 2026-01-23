import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const signup = async (data) => {
  const { email, password, fullName } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      onboardingStep: 0,
    },
  });

  return { user };
};

export const login = async (data) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user.id, email: user.email });
  
  // Remove passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};
