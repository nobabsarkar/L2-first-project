import express from 'express';
import { AcademicSemesterController } from './academicSemester.controller';
import validateRequest from '../../middleweres/validateRequest';
import { AcademicSemesterValidationSchema } from './academicSemester.validation';
import auth from '../../middleweres/auth';

const router = express.Router();

router.post(
  '/create-academic-semester',
  validateRequest(
    AcademicSemesterValidationSchema.createAcademicSemesterValidation,
  ),
  AcademicSemesterController.createAcademicSemester,
);

router.get(
  '/:semesterId',
  AcademicSemesterController.getSingleAcademicSemester,
);

router.get(
  '/',
  auth('admin'),
  AcademicSemesterController.getAllAcademicSemester,
);

router.patch(
  '/:courseId',
  validateRequest(
    AcademicSemesterValidationSchema.updateAcademicSemesterValidationSchema,
  ),
  AcademicSemesterController.updateAcademicSemester,
);

export const AcademicSemesterRoutes = router;
