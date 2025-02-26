/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import config from '../../config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { TFaculty } from '../Faculty/faculty.interface';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { Faculty } from '../Faculty/faculty.model';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const createStudentIntoDB = async (
  file: any,
  password: string,
  payload: TStudent,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given , use default password
  userData.password = password || (config.default_password as string);

  // set student role
  userData.role = 'student';
  // set student email
  userData.email = payload.email;

  // find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );

  if (!admissionSemester) {
    throw new AppError(400, 'Admission semester not found');
  }

  const seation = await mongoose.startSession();

  try {
    seation.startTransaction();
    // set generated is
    if (admissionSemester) {
      userData.id = await generateStudentId(admissionSemester);
    }

    if (file) {
      const imageName = `${userData?.id}${payload?.name?.firstName}`;
      const path = file?.path;
      // send image to cloudinary
      const { secure_url }: any = await sendImageToCloudinary(imageName, path);
      payload.profileImage = secure_url;
    }

    // create a user (transaction-1)
    const newUser = await User.create([userData], { seation }); // array

    // create a student
    if (!newUser.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //user referance _id

    // create a user (transaction-2)
    const newStudent = await Student.create([payload], { seation });

    if (!newStudent) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create student');
    }

    await seation.commitTransaction();
    await seation.endSession();

    return newStudent;
  } catch (err) {
    await seation.abortTransaction();
    await seation.endSession();
    console.log(err);
    throw new Error('Failed to create student');
  }
};

const createFacultyIntoDB = async (
  file: any,
  password: string,
  payload: TFaculty,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given , use default password
  userData.password = password || (config.default_password as string);

  // set faculty role
  userData.role = 'faculty';
  // set faculty email
  userData.email = payload.email;

  // find academic department info
  const academicDepartment = await AcademicDepartment.findById(
    payload.academicDepartment,
  );

  if (!academicDepartment) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Academic department not found',
    );
  }

  payload.academicDepartment = academicDepartment?.academicFaculty;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // set generated id

    userData.id = await generateFacultyId();

    if (file) {
      const imageName = `${userData?.id}${payload?.name?.firstName}`;
      const path = file?.path;
      // send image to cloudinary
      const { secure_url }: any = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url;
    }

    // create a user (transaction - 1)
    const newUser = await User.create([userData], { session }); // array

    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; // referance _id

    // create a faculty (transaction-2)
    const newFaculty = await Faculty.create([payload], { session });

    if (!newFaculty.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create faculty');
    }

    await session.commitTransaction();
    await session.endSession();

    return newFaculty;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const createAdminIntoDB = async (
  file: any,
  password: string,
  payload: TAdmin,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given , use default password
  userData.password = password || (config.default_password as string);

  // set admin role
  userData.role = 'admin';
  // set admin email
  userData.email = payload.email;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // set generated id
    userData.id = await generateAdminId();

    if (file) {
      const imageName = `${userData?.id}${payload?.name?.firstName}`;
      const path = file?.path;
      // send image to cloudinary
      const { secure_url }: any = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url;
    }

    // create a user (transaction - 1)
    const newUser = await User.create([userData], { session });

    // create a admin
    if (!newUser.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
    }

    // set id, _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id; //  referance _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payload], { session });

    // create a admin
    if (!newAdmin.length) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

const getMe = async (userId: string, role: string) => {
  let result = null;

  if (role === 'student') {
    result = await Student.findOne({ id: userId }).populate('user');
  }

  if (role === 'admin') {
    result = await Admin.findOne({ id: userId }).populate('user');
  }

  if (role === 'faculty') {
    result = await Admin.findOne({ id: userId }).populate('user');
  }

  return result;
};

export const UserService = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
  changeStatus,
  getMe,
};
