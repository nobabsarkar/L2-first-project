import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import globalErrorHandler from './app/middleweres/globalErrorhandler';
import notFound from './app/middleweres/notFound';
import router from './app/routes';
import cookieParser from 'cookie-parser';

const app: Application = express();

//parssers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({ origin: ['https://phum-client-beta.vercel.app'], credentials: true }),
);

// application route
app.use('/api/v1', router);

// const test = async (req: Request, res: Response) => {
//   const a = 10;
//   res.send(a);
// };

// app.get('/', test);

app.get('/', (req: Request, res: Response) => {
  res.send('Server Is Running!');
});

app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app;
