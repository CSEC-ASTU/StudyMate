import * as profileService from '../services/profile.service.js';

export const updateStep1Handler = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await profileService.updateOnboardingStep1(userId, req.body);
    res.status(200).json({ message: 'Onboarding step 1 completed', profile: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStep2Handler = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await profileService.updateOnboardingStep2(userId, req.body);
    res.status(200).json({ message: 'Onboarding step 2 completed', profile: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
