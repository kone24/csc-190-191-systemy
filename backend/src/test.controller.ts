import { Controller, Get } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('test')
export class TestController {
  @Get('email')
  async testEmail() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: 'rachelfshindelus@gmail.com', // Testing w/ my own
      subject: 'Test Email',
      html: '<p>Email works 🎉</p>',
    });

    return {
      message: 'Email sent!',
      info,
    };
  }
}