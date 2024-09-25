import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import Button from '~/components/button';
import Logo from '../components/logo';

export default function VerifyReservation({
  name = '{user}',
  deceaseName = '{deceased}',
}: {
  name: string | undefined;
  deceaseName: string | undefined;
}) {
  return (
    <Html>
      <Head />
      <Preview>Hi {name}, Kabar baik! Reservasi anda telah di terima!</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Logo style={logoStyle} />
          <Heading style={h1Style}>
            Hi {name}, Kabar baik! Reservasi anda telah di terima!
          </Heading>
          <Text
            style={{
              ...textStyle,
              color: '#ababab',
              marginTop: '14px',
              marginBottom: '16px',
            }}
          >
            Reservasi dengan atas nama almarhum {deceaseName} telah diterima,
            click link dibawah untuk melihat riwayat reservasi
          </Text>
          <Link href={'https://simpelman.fly.dev/history'} target='_blank'>
            <Button text='Lihat riwayat reservasi' style={buttonStyle} />
          </Link>
          <Text
            style={{
              ...textStyle,
              color: '#ababab',
              marginTop: '14px',
              marginBottom: '16px',
            }}
          >
            Jika Anda mengalami kesulitan, Anda dapat menghubungi tim dukungan
            kami. <br /> Dibawah ini
          </Text>
          <Link
            href='https://wa.me/6288222886364'
            target='_blank'
            style={{
              ...linkStyle,
              display: 'block',
              marginTop: '16px',
              color: '#898989',
            }}
          >
            Customer Service
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const mainStyle = {
  backgroundColor: '#ffffff',
};

const containerStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
};

const logoStyle = {
  paddingTop: '20px',
};

const h1Style = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '30px',
  marginTop: '20px',
  padding: '0',
};

const buttonStyle = {
  width: '100%',
  padding: 16,
  borderRadius: 4,
  color: '#ffffff',
  cursor: 'pointer',
  marginBottom: 16,
  backgroundColor: '#0f9650',
  border: 'none',
};

const linkStyle = {
  color: '#0f9650',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const textStyle = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};

const footerStyle = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
