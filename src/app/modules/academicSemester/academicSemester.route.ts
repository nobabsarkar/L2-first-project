import express from 'express';
import { AcademicSemesterController } from './academicSemester.controller';
import validateRequest from '../../middleweres/validateRequest';
import { AcademicSemesterValidationSchema } from './academicSemester.validation';
import auth from '../../middleweres/auth';

const router = express.Router();

router.post(
  '/create-academicSemester',
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

export const AcademicSemesterRoutes = router;
