import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import {
  AcademicSemesterName,
  academicSemesterNameCodeMapper,
} from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';
import QueryBuilder from '../../builder/QueryBuilder';

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

// const getAllAcademicSemesterIntoDB = async () => {
//   const result = await AcademicSemester.find();
//   return result;
// };

const getAllAcademicSemesterIntoDB = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(AcademicSemester.find(), query)
    .search(AcademicSemesterName)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await adminQuery.modelQuery;
  return result;
};

const updateAcademicSemesterIntoDB = async (
  id: string,
  payload: Partial<TAcademicSemester>,
) => {
  if (
    payload.name &&
    payload.code &&
    academicSemesterNameCodeMapper[payload.name] !== payload.code
  ) {
    throw new Error('Invalid Semester Code');
  }

  const result = await AcademicSemester.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getSilgleAcademicSemesterIntoDB,
  getAllAcademicSemesterIntoDB,
  updateAcademicSemesterIntoDB,
};
