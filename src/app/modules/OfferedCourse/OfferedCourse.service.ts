import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { TOfferedCourse } from './OfferedCourse.interface';
import { OfferedCourse } from './OfferedCourse.model';
import { Faculty } from '../Faculty/faculty.model';
import { Course } from '../Course/course.model';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { hasTimeConflict } from './OfferedCourse.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { Student } from '../student/student.model';

const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    section,
    faculty,
    days,
    startTime,
    endTime,
  } = payload;

  // check if the semester registration id is exists! here
  const isSemesterRegistrationExits =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExits) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Semester registration not found !',
    );
  }

  const academicSemester = isSemesterRegistrationExits.academicSemester;

  const isAcademicFacultyExits =
    await AcademicFaculty.findById(academicFaculty);
  if (!isAcademicFacultyExits) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Academic Faculty not found !');
  }

  const isAcademicDepartmentExits =
    await AcademicDepartment.findById(academicDepartment);
  if (!isAcademicDepartmentExits) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Academic Department not found !',
    );
  }

  const isCourseExits = await Course.findById(course);
  if (!isCourseExits) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Course not found !');
  }

  const isFacultyExits = await Faculty.findById(faculty);
  if (!isFacultyExits) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Faculty not found !');
  }

  // check if the department is belong to the faculty
  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });
  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `This ${isAcademicDepartmentExits.name} is not belong to this ${isAcademicFacultyExits.name}`,
    );
  }

  // check if the same offered course same section in samme registred semester exists
  const isSameOfferedCourseExistsWithSameRegisterdSemesterWithSameSection =
    await OfferedCourse.findOne({
      semesterRegistration,
      course,
      section,
    });
  if (isSameOfferedCourseExistsWithSameRegisterdSemesterWithSameSection) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Offered course with same section is already exist!`,
    );
  }

  // get the schedules of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `This faculty is not available at that time ! Choose other time or day`,
    );
  }

  const result = await OfferedCourse.create({ ...payload, academicSemester });
  return result;
};

const getAllOfferedCoursesFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(OfferedCourse.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await offeredCourseQuery.modelQuery;
  const meta = await offeredCourseQuery.countTotal();

  return { meta, result };
};

// const getMyOfferedCoursesFromDB = async (userId: string) => {
//   const student = await Student.findOne({ id: userId });
//   // find the student
//   if (!student) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
//   }

//   // find current ongoing semester
//   const currentOngoingRegistrationSemester = await SemesterRegistration.findOne(
//     {
//       status: 'ONGOING',
//     },
//   );

//   if (!currentOngoingRegistrationSemester) {
//     throw new AppError(
//       StatusCodes.NOT_FOUND,
//       'There is no ongoing semester registration',
//     );
//   }

//   const result = await OfferedCourse.aggregate([
//     {
//       $match: {
//         semesterRegistration: currentOngoingRegistrationSemester?._id,
//         academicFaculty: student?.academicFaculty,
//         academicDepartment: student?.academicDepartment,
//       },
//     },
//     {
//       $lookup: {
//         from: 'courses',
//         localField: 'course',
//         foreignField: '_id',
//         as: 'course',
//       },
//     },
//   ]);

//   return result;
// };

// const getMyOfferedCoursesFromDB = async (
//   userId: string,
//   query: Record<string, unknown>,
// ) => {
//   //   // pagination setup

//   const page = Number(query?.page) || 1;
//   const limit = Number(query?.limit) || 10;
//   const skip = (page - 1) * limit;

//   console.log('hello');

//   const student = await Student.findOne({ id: userId });

//   // find the student
//   if (!student) {
//     throw new AppError(StatusCodes.NOT_FOUND, 'User is not found');
//   }

//   // find current ongoing semester
//   const currentOngoingRegisterSemester = await SemesterRegistration.findOne({
//     status: 'ONGOING',
//   });

//   if (!currentOngoingRegisterSemester) {
//     throw new AppError(
//       StatusCodes.NOT_FOUND,
//       'There is no ongoing semester registration ',
//     );
//   }

//   const aggregrationQuery = await OfferedCourse.aggregate([
//     {
//       $match: {
//         semesterRegistration: currentOngoingRegisterSemester?._id,
//         academicFaculty: student?.academicFaculty,
//         academicDepartment: student?.academicDepartment,
//       },
//     },
//     {
//       $lookup: {
//         from: 'courses',
//         localField: 'course',
//         foreignField: '_id',
//         as: 'course',
//       },
//     },
//     {
//       $unwind: '$course',
//     },
//     {
//       $lookup: {
//         from: 'enrolledcourses',
//         let: {
//           currentOngoingRegisterSemester: currentOngoingRegisterSemester?._id,
//           currentStudent: student?._id,
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   {
//                     $eq: [
//                       '$semesterRegistration',
//                       '$$currentOngoingRegisterSemester',
//                     ],
//                   },
//                   {
//                     $eq: ['$student', '$$currentStudent'],
//                   },
//                   {
//                     $eq: ['$isEnrolled', true],
//                   },
//                 ],
//               },
//             },
//           },
//         ],
//         as: 'enrolledCourses',
//       },
//     },
//     {
//       $lookup: {
//         from: 'enrolledcourses',
//         let: {
//           currentStudent: student?._id,
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   {
//                     $eq: ['$student', '$$currentStudent'],
//                   },
//                   {
//                     $eq: ['$isCompleted', true],
//                   },
//                 ],
//               },
//             },
//           },
//         ],
//         as: 'completedCourses',
//       },
//     },
//     {
//       $addFields: {
//         completedCourseIds: {
//           $map: {
//             input: '$completedCourses',
//             as: 'completed',
//             in: '$$completed.course',
//           },
//         },
//       },
//     },
//     {
//       $addFields: {
//         isPreRequisitesFulFilled: {
//           $or: [
//             { $eq: ['$course.preRequisiteCourses', []] },
//             {
//               $setIsSubset: [
//                 '$course.preRequisiteCourses.course',
//                 '$completedCourseIds',
//               ],
//             },
//           ],
//         },

//         isAlreadyEnrolled: {
//           $in: [
//             '$course._id',
//             {
//               $map: {
//                 input: '$enrolledCourses',
//                 as: 'enroll',
//                 in: '$$enroll.course',
//               },
//             },
//           ],
//         },
//       },
//     },
//     {
//       $match: {
//         isAlreadyEnrolled: false,
//         isPreRequisitesFulFilled: true,
//       },
//     },
//   ]);

//   const paginationQuery = [
//     {
//       $skip: skip,
//     },
//     {
//       $limit: limit,
//     },
//   ];

//   const result = await OfferedCourse.aggregate([
//     ...aggregrationQuery,
//     ...paginationQuery,
//   ]);

//   const total = (await OfferedCourse.aggregate(aggregrationQuery)).length;
//   const totalPage = Math.ceil(result.length / limit);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//       totalPage,
//     },
//     result,
//   };
// };

const getMyOfferedCoursesFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  //pagination setup

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;

  const student = await Student.findOne({ id: userId });
  // find the student
  if (!student) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User is noty found');
  }

  //find current ongoing semester
  const currentOngoingRegistrationSemester = await SemesterRegistration.findOne(
    {
      status: 'ONGOING',
    },
  );

  if (!currentOngoingRegistrationSemester) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'There is no ongoing semester registration!',
    );
  }

  const aggregationQuery = [
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester?._id,
        academicFaculty: student.academicFaculty,
        academicDepartment: student.academicDepartment,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: '$course',
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentOngoingRegistrationSemester:
            currentOngoingRegistrationSemester._id,
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$semesterRegistration',
                      '$$currentOngoingRegistrationSemester',
                    ],
                  },
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isEnrolled', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'enrolledCourses',
      },
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isCompleted', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'completedCourses',
      },
    },
    {
      $addFields: {
        completedCourseIds: {
          $map: {
            input: '$completedCourses',
            as: 'completed',
            in: '$$completed.course',
          },
        },
      },
    },
    {
      $addFields: {
        isPreRequisitesFulFilled: {
          $or: [
            { $eq: ['$course.preRequisiteCourses', []] },
            {
              $setIsSubset: [
                '$course.preRequisiteCourses.course',
                '$completedCourseIds',
              ],
            },
          ],
        },

        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledCourses',
                as: 'enroll',
                in: '$$enroll.course',
              },
            },
          ],
        },
      },
    },
    {
      $match: {
        isAlreadyEnrolled: false,
        isPreRequisitesFulFilled: true,
      },
    },
  ];

  const paginationQuery = [
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const result = await OfferedCourse.aggregate([
    ...aggregationQuery,
    ...paginationQuery,
  ]);

  const total = (await OfferedCourse.aggregate(aggregationQuery)).length;

  const totalPage = Math.ceil(result.length / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
};

const getSingleOfferedCourseFromDB = async (id: string) => {
  const result = await OfferedCourse.findById(id);
  return result;
};

const updateOfferedCourseIntoDB = async (
  id: string,
  payload: Pick<TOfferedCourse, 'faculty' | 'days' | 'startTime' | 'endTime'>,
) => {
  const { faculty, days, startTime, endTime } = payload;

  const isOfferedCourseExists = await OfferedCourse.findOne({ id });
  if (!isOfferedCourseExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Offered Course not found !');
  }

  const isFacultyExists = await Faculty.findById(faculty);
  if (!isFacultyExists) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Faculty not found !');
  }

  const semesterRegistration = isOfferedCourseExists.semesterRegistration;
  // get the schedules of the faculties

  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration);
  if (semesterRegistrationStatus?.status !== 'UPCOMING') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `You can not update this offered course as it is ${semesterRegistrationStatus?.status}`,
    );
  }

  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  }).select('days startTime endTime');

  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule)) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `This faculty is not available at that time ! Choose other time or day`,
    );
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const OfferedCourseService = {
  createOfferedCourseIntoDB,
  getAllOfferedCoursesFromDB,
  getSingleOfferedCourseFromDB,
  getMyOfferedCoursesFromDB,
  updateOfferedCourseIntoDB,
};
