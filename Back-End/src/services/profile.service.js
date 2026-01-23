import prisma from '../config/prisma.js';

export const updateOnboardingStep1 = async (userId, data) => {
  const { educationLevel, institutionName } = data;

  // Upsert profile (create or update)
  const profile = await prisma.profile.upsert({
    where: { userId },
    update: { educationLevel, institutionName },
    create: { userId, educationLevel, institutionName },
  });

  // Update user onboarding step
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingStep: 1 },
  });

  return profile;
};

export const updateOnboardingStep2 = async (userId, data) => {
  const { university, department, program, yearOrSemester } = data;

  const profile = await prisma.profile.update({
    where: { userId },
    data: {
      university,
      department,
      program,
      yearOrSemester,
      // If user comes back to step 2, ensure needed fields are set
    },
  });

   // Update user onboarding step
   await prisma.user.update({
    where: { id: userId },
    data: { onboardingStep: 2 },
  });

  return profile;
};
