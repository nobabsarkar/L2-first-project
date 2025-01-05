import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { academicSemesterNameCodeMapper } from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payload: TAcademicSemester) => {
  // semester name --> semester code

  if (academicSemesterNameCodeMapper[payload.name] !== payload.code) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Invalid Semester code');
  }

  const result = await AcademicSemester.create(payload);
  return result;
};

const getSilgleAcademicSemesterIntoDB = async (_id: string) => {
  const result = await AcademicSemester.findOne({ _id });
  return result;
};

const getAllAcademicSemesterIntoDB = async () => {
  const result = await AcademicSemester.find();
  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getSilgleAcademicSemesterIntoDB,
  getAllAcademicSemesterIntoDB,
};
