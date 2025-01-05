import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production', // true for port 465, false for other ports
    auth: {
      user: 'nobabsarkar2020@gmail.com',
      pass: 'jn7jnAPss4f63QBp6D', // need password
    },
  });

  await transporter.sendMail({
    from: 'nobabsarkar2020@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset your password within 10 min!', // Subject line
    text: '', // plain text body
    html, // html body
  });
};
