import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      user: 'nobabsarkar2020@gmail.com',
      pass: 'ceyj anzc krxd scev', // this is my app password. if i am going to manage account and go to setting i can't find this password, i used chatgpt for find app password. i chat google and create app password
    },
  });

  await transporter.sendMail({
    from: 'nobabsarkar2020@gmail.com',
    to,
    subject: 'Reset your password within 10 mins!',
    text: '',
    html,
  });
};
