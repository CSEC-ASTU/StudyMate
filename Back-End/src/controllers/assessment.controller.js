import * as assessmentService from '../services/assessment.service.js';

export const createAssessment = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Validation is handled by middleware
    const { body } = req;
    
    // Note: req.user.id coming from auth middleware
    const assessment = await assessmentService.createAssessment(courseId, req.user.id, body);
    
    res.status(201).json(assessment);
  } catch (error) {
    if (error.message === 'Course not found' || error.message === 'Unauthorized') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Create Assessment Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assessments = await assessmentService.getCourseAssessments(courseId, req.user.id);
    res.json(assessments);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Get Assessments Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
