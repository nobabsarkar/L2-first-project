/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserService } from './user.service';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';

const createStudent = catchAsync(async (req, res) => {
  // creating a schema validation using zot

  const { password, student: studentData } = req.body;
  // data validation using Joi
  // const { error, value } = studentValidationSchema.validate(studentData);

  // data validation using zod
  // const zodparseData = studentValidationSchema.parse(studentData);

  const result = await UserService.createStudentIntoDB(password, studentData);

  // if (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: 'something went wrong',
  //     error: error.details,
  //   });
  // }

  // res.status(200).json({
  //   success: true,
  //   message: 'Student is retrived successfully',
  //   data: result,
  // });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Student is created successfully',
    data: result,
  });
});

const createFaculty = catchAsync(async (req, res) => {
  const { password, faculty } = req.body;

  const result = await UserService.createFacultyIntoDB(password, faculty);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Faculty is created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { password, admin } = req.body;
  const result = await UserService.createAdminIntoDB(password, admin);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin is created successfully',
    data: result,
  });
});

export const UserControllers = {
  createStudent,
  createFaculty,
  createAdmin,
};
