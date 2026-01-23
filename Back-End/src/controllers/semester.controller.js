import * as semesterService from '../services/semester.service.js';

export const create = async (req, res) => {
  try {
    const semester = await semesterService.createSemester(req.user.id, req.body);
    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create semester', error: error.message });
  }
};

export const list = async (req, res) => {
  try {
    const semesters = await semesterService.getUserSemesters(req.user.id);
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch semesters', error: error.message });
  }
};

export const get = async (req, res) => {
  try {
    const semester = await semesterService.getSemesterById(req.user.id, req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.json(semester);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch semester', error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await semesterService.deleteSemester(req.user.id, req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete semester', error: error.message });
  }
};
