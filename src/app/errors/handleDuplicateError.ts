/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../../interface/error';

const handleduplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/"([^"]+)"/)[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${match} is already exits`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  };
};

export default handleduplicateError;
