import { ActionFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react';
import bcrypt from 'bcryptjs';
import { BackSquare } from 'iconsax-react';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
import Button from '~/components/button';
import InputPassword from '~/components/input-password';
import InputText from '~/components/input-text';
import useCustomForm from '~/hooks/useCustomForm';
import { prisma } from '~/services/db.server';
import {
  ActionErrors,
  validateAction,
  validatePassword,
  validatePhoneNumber,
} from '~/utils/common/validate';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  idCard: z.string().min(16),
  phoneNumber: z.string().min(10).refine(validatePhoneNumber, {
    message: "Tidak boleh dimulai dengan '62'",
  }),
  password: z.string().min(8).refine(validatePassword, {
    message:
      'Password harus memiliki setidaknya satu huruf besar dan karakter unik',
  }),
});

export type SignUpSchema = z.infer<typeof schema>;

type ActionSignUp = Partial<
  SignUpSchema & {
    errors: ActionErrors<SignUpSchema> | null;
  }
>;

export async function action({ request }: ActionFunctionArgs) {
  const { formData, errors } = await validateAction<SignUpSchema>({
    request,
    schema,
  });

  if (errors) {
    return json<ActionSignUp>(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors,
      },
      { status: 400 }
    );
  }

  const { email, password, idCard, name, phoneNumber } = formData;

  const [user, idCardUser, _phoneNumber] = await prisma.$transaction([
    prisma.user.findUnique({
      where: {
        email,
      },
    }),
    prisma.user.findUnique({
      where: {
        idCard,
      },
    }),
    prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    }),
  ]);

  if (user) {
    return json<ActionSignUp>(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          email: 'Email sudah terdaftar',
        },
      },
      {
        status: 400,
      }
    );
  }

  if (idCardUser) {
    return json<ActionSignUp>(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          idCard: 'Nomor KTP sudah terdaftar',
        },
      },
      {
        status: 400,
      }
    );
  }

  if (_phoneNumber) {
    return json<ActionSignUp>(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          phoneNumber: 'Nomor HP sudah terdaftar',
        },
      },
      {
        status: 400,
      }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      idCard,
      name,
      phoneNumber,
    },
  });

  return redirectWithSuccess('/signin', {
    message: 'Berhasil mendaftar',
  });
}

export default function Signup() {
  const navigate = useNavigate();
  const data = useActionData<ActionSignUp>();
  const navigation = useNavigation();

  const { control } = useCustomForm<SignUpSchema>({
    defaultValues: {
      name: '',
      email: '',
      idCard: '',
      phoneNumber: '',
      password: '',
    },
  });

  return (
    <div className='px-[7.5rem] py-[1rem] flex flex-col gap-5'>
      <button
        className='flex items-center gap-2.5'
        onClick={() =>
          navigate({
            pathname: '/',
          })
        }
      >
        <BackSquare color='#0f9650' size={20} />
        <p className='text-primary-500 font-medium'>Kembali</p>
      </button>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col gap-3'>
          <p className='font-bold text-4xl text-base-800'>Daftar</p>
          <p className='font-medium text-base-400'>
            Akses layanan kami dengan daftar ke akun anda
          </p>
        </div>
        <Form className='flex flex-col gap-2' method='post'>
          <InputText
            label='Nama'
            isHookForm
            control={control}
            placeholder='Masukan nama lengkap'
            controlName='name'
            error={data?.errors?.name}
          />
          <InputText
            label='Email'
            type='email'
            isHookForm
            control={control}
            placeholder='Masukan email'
            controlName='email'
            error={data?.errors?.email}
          />
          <InputText
            label='Nomor KTP'
            isHookForm
            control={control}
            placeholder='Masukan nomor KTP'
            controlName='idCard'
            error={data?.errors?.idCard}
          />
          <InputText
            label='No Handphone'
            isHookForm
            control={control}
            placeholder='Masukan nomor HP'
            description="Nomor HP tidak boleh dimulai dengan '62'"
            controlName='phoneNumber'
            isPrefix
            renderPrefix={
              <div className='p-4 rounded-lg border border-base-300 justify-center items-center flex text-sm text-base-400'>
                +62
              </div>
            }
            error={data?.errors?.phoneNumber}
          />
          <InputPassword
            label='Password'
            isHookForm
            control={control}
            placeholder='Masukan password'
            description='Password harus memiliki setidaknya satu huruf besar dan karakter unik'
            controlName='password'
            error={data?.errors?.password}
          />
          <Button
            type='submit'
            text='Daftar'
            size='full'
            loading={navigation.state === 'loading'}
          />
        </Form>
        <Button
          className='mt-3'
          onClick={() => navigate('/signin')}
          text='Masuk'
          variant='outline'
          size='full'
          loading={navigation.state === 'loading'}
        />
      </div>
    </div>
  );
}
