import express from 'express';
import validateRequest from '../../middleweres/validateRequest';
import { AcademicDepartmentValidation } from './academicDepartment.validation';
import { AcademicDepartmentControllser } from './academicDepartment.controller';

const router = express.Router();

router.post(
  '/create-academic-department',
  // validateRequest(
  //   AcademicDepartmentValidation.createAcadmeicDepartmentValidationSchema,
  // ),
  AcademicDepartmentControllser.createAcademicDepartment,
);

router.get(
  '/:departmentId',
  AcademicDepartmentControllser.getSingleAcademicDepartment,
);

router.patch(
  '/:departmentId',
  validateRequest(
    AcademicDepartmentValidation.updateAcademicDepartmentValidationSchema,
  ),
  AcademicDepartmentControllser.updateAcademicDepartment,
);

router.get('/', AcademicDepartmentControllser.getAllAcademicDepartment);

export const AcademicDepartmentRoutes = router;
