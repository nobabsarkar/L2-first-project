import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middleweres/validateRequest';
import { studentValidations } from './student.validation';
import auth from '../../middleweres/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  StudentControllers.getSingleStudents,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(studentValidations.updateStudentValidationSchema),

  StudentControllers.updateStudent,
);

router.delete('/:id', StudentControllers.deleteStudent);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.faculty),
  StudentControllers.getAllStudents,
);

export const StudentRoutes = router;
