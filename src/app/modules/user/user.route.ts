import express from 'express';
import { studentValidations } from '../student/student.validation';
import validateRequest from '../../middleweres/validateRequest';
import { UserControllers } from './user.controller';
import { AdminValidations } from '../Admin/admin.validation';
import { FacultValidations } from '../Faculty/faculty.validation';
import auth from '../../middleweres/auth';
import { USER_ROLE } from './user.constant';

const router = express.Router();

router.post(
  '/create-student',
  auth(USER_ROLE.admin),
  validateRequest(studentValidations.createStudentValidationSchema),
  UserControllers.createStudent,
);

router.post(
  '/create-faculty',
  auth(USER_ROLE.admin),
  validateRequest(FacultValidations.createFacultyValidation),
  UserControllers.createFaculty,
);

router.post(
  '/create-admin',
  // auth(USER_ROLE.admin),
  validateRequest(AdminValidations.createAdminValidationSchema),
  UserControllers.createAdmin,
);

export const UserRoutes = router;
