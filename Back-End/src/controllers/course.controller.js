import * as courseService from '../services/course.service.js';

export const create = async (req, res) => {
  try {
    const { id: semesterId } = req.params;
    const course = await courseService.createCourse(req.user.id, semesterId, req.body);
    res.status(201).json(course);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};
 
export const listBySemester = async (req, res) => {
  try {
    const { id: semesterId } = req.params;
    const courses = await courseService.getSemesterCourses(req.user.id, semesterId);
    if (!courses) {
        return res.status(404).json({ message: 'Semester not found' });
    }
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

export const get = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.user.id, req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};
