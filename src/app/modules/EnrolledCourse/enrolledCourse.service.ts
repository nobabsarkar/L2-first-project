import { TEnorolledCourse } from './enrolledCourse.interface';

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnorolledCourse,
) => {
  // step1:check if the offered course is exists
  // step2: check if the student is already enrolled
  // step3: create an enrolled course
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
};
