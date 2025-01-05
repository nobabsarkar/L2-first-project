import jwt from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: string; role: string },
  serect: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, serect, {
    expiresIn,
  });
};
