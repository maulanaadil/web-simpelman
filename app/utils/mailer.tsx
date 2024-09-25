import { render } from '@react-email/components';
import nodemailer from 'nodemailer';
import ResetPassword from 'react-email/emails/ResetPassword';
import MagicLink from 'react-email/emails/MagicLink';

type SendEmailProps = {
  name: string | null | undefined;
  to: string | undefined;
  link: string;
  type: 'verify' | 'forgot-password';
};

if (
  !process.env.SMPTP_MAIL_USER ||
  !process.env.SMTP_MAIL_PASSWORD ||
  !process.env.SMTP_MAIL_HOST ||
  !process.env.SMTP_MAIL_PORT
) {
  throw new Error('SMTP credentials not found');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  port: parseInt(process.env.SMTP_MAIL_HOST as string),
  auth: {
    user: process.env.SMPTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});

export async function sendEmail({ to, link, name, type }: SendEmailProps) {
  const options = {
    from: process.env.SMPTP_MAIL_USER,
    to,
  };

  if (type === 'verify') {
    const html = await render(<MagicLink name={name || ''} link={link} />);
    return await transporter.sendMail({
      subject: 'Email Verification',
      html,
      ...options,
    });
  }

  if (type === 'forgot-password') {
    const html = await render(<ResetPassword name={name || ''} link={link} />);
    return await transporter.sendMail({
      subject: 'Reset Password',
      html,
      ...options,
    });
  }
}
