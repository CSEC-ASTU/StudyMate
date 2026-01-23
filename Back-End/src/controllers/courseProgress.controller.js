import * as progressService from '../services/courseProgress.service.js';

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await progressService.getCourseProgress(courseId, req.user.id);
    
    if (!progress) {
      // Return 404 or just empty structure? 
      // If course belongs to user but no progress, service returns "upserted" progress?
      // Service returns null if unauthorized.
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get Course Progress Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
