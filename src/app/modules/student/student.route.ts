import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middleweres/validateRequest';
import { studentValidations } from './student.validation';

const router = express.Router();

// will call controller function

router.get('/:id', StudentControllers.getSingleStudents);

router.patch(
  '/:id',
  validateRequest(studentValidations.updateStudentValidationSchema),

  StudentControllers.updateStudent,
);

router.delete('/:id', StudentControllers.deleteStudent);

router.get('/', StudentControllers.getAllStudents);

export const StudentRoutes = router;
