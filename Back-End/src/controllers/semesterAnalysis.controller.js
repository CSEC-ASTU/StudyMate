import * as analysisService from '../services/semesterAnalysis.service.js';

export const getSemesterAnalysis = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const analysis = await analysisService.getSemesterAnalysis(semesterId, req.user.id);
    
    if (!analysis) {
      return res.status(404).json({ message: 'Semester not found or unauthorized' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get Semester Analysis Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
