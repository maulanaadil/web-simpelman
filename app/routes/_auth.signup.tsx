import { zodResolver } from '@hookform/resolvers/zod';
import { ActionFunctionArgs } from '@remix-run/node';
import { Form, json, useNavigate, useNavigation } from '@remix-run/react';
import bcrypt from 'bcryptjs';
import { BackSquare } from 'iconsax-react';
import { getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { redirectWithSuccess } from 'remix-toast';
import { z } from 'zod';
import Button from '~/components/button';
import InputPassword from '~/components/input-password';
import InputText from '~/components/input-text';
import { prisma } from '~/services/db.server';
import { validatePassword, validatePhoneNumber } from '~/utils/common/validate';

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

export async function action({ request }: ActionFunctionArgs) {
  const { data, errors } = await getValidatedFormData<SignUpSchema>(
    request,
    zodResolver(schema)
  );

  if (errors) {
    return json(
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

  const { email, password, idCard, name, phoneNumber } = data;

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
    return json(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          email: {
            message: 'Email sudah terdaftar',
          },
        },
      },
      {
        status: 400,
      }
    );
  }

  if (idCardUser) {
    return json(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          idCard: {
            message: 'Nomor KTP sudah terdaftar',
          },
        },
      },
      {
        status: 400,
      }
    );
  }

  if (_phoneNumber) {
    return json(
      {
        email: undefined,
        password: undefined,
        idCard: undefined,
        phoneNumber: undefined,
        name: undefined,
        errors: {
          phoneNumber: {
            message: 'Nomor HP sudah terdaftar',
          },
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
  const navigation = useNavigation();

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useRemixForm<SignUpSchema>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
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
        <Form
          className='flex flex-col gap-2'
          method='post'
          onSubmit={handleSubmit}
        >
          <InputText
            label='Nama'
            isHookForm
            control={control}
            placeholder='Masukan nama lengkap'
            controlName='name'
            error={errors?.name?.message}
          />
          <InputText
            label='Email'
            type='email'
            isHookForm
            control={control}
            placeholder='Masukan email'
            controlName='email'
            error={errors?.email?.message}
          />
          <InputText
            label='Nomor KTP'
            isHookForm
            control={control}
            placeholder='Masukan nomor KTP'
            controlName='idCard'
            error={errors?.idCard?.message}
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
            error={errors?.phoneNumber?.message}
          />
          <InputPassword
            label='Password'
            isHookForm
            control={control}
            placeholder='Masukan password'
            description='Password harus memiliki setidaknya satu huruf besar dan karakter unik'
            controlName='password'
            error={errors?.password?.message}
          />
          <Button
            type='submit'
            className='mt-2'
            text='Daftar'
            size='full'
            loading={navigation.state === 'loading'}
          />
        </Form>
        <div className='flex items-center justify-center my-3'>
          <div className='h-[1px] bg-base-300 w-1/2'></div>
          <div className='px-4 text-base-300'>Atau</div>
          <div className='h-[1px] bg-base-300 w-1/2'></div>
        </div>
        <Button
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
