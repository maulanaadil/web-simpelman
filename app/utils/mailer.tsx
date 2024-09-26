import { render } from '@react-email/components';
import nodemailer from 'nodemailer';
import ResetPassword from 'react-email/emails/ResetPassword';
import MagicLink from 'react-email/emails/MagicLink';
import VerifyReservation from 'react-email/emails/VerifyReservation';

type SendEmailProps =
  | {
      name: string | null | undefined;
      to: string | undefined;
      link: string;
      type: 'verify' | 'forgot-password';
    }
  | {
      name: string | null | undefined;
      to: string | undefined;
      deceasedName: string | null | undefined;
      type: 'verified-reservation';
    };

if (
  !process.env.SMPTP_MAIL_USER ||
  !process.env.SMTP_MAIL_PASSWORD ||
  !process.env.SMTP_MAIL_HOST ||
  !process.env.SMTP_MAIL_PORT ||
  !process.env.SMPTP_MAIL_EMAIL
) {
  throw new Error('SMTP credentials not found');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  port: parseInt(process.env.SMTP_MAIL_PORT as string),
  auth: {
    user: process.env.SMPTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});

export async function sendEmail(body: SendEmailProps) {
  const options = {
    from: process.env.SMPTP_MAIL_EMAIL,
    to: body.to,
  };

  if (body.type === 'verified-reservation') {
    const html = await render(
      <VerifyReservation
        name={body.name || ''}
        deceaseName={body.deceasedName || ''}
      />
    );
    return await transporter.sendMail({
      subject: 'Reservasi Diterima',
      html,
      ...options,
    });
  }

  if (body.type === 'verify') {
    const html = await render(
      <MagicLink name={body.name || ''} link={body.link} />
    );
    return await transporter.sendMail({
      subject: 'Verifikasi Email',
      html,
      ...options,
    });
  }

  if (body.type === 'forgot-password') {
    const html = await render(
      <ResetPassword name={body.name || ''} link={body.link} />
    );
    return await transporter.sendMail({
      subject: 'Reset Password',
      html,
      ...options,
    });
  }
}
