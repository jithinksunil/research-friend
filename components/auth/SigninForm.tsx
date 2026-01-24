'use client';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { SigninFormInterface } from '@/interfaces';
import { toastMessage } from '@/lib/toast';
import { PasswordInput, TextInput } from '../form';
import { PrimaryButton } from '../common';
import { signIn, useSession } from 'next-auth/react';

const schema = yup.object().shape({
  password: yup.string().trim().required('Password is required').defined(),
  email: yup
    .string()
    .email('Email must be valid')
    .trim()
    .required('Email is required')
    .defined(),
});

const defaultValues: SigninFormInterface = {
  password: '',
  email: '',
};

export function SigninForm() {
  const [loading, setLoading] = useState(false);
  const { replace, push } = useRouter();
  const [isPending, startTransition]=useTransition()
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('message')) {
      replace('/');
      toastMessage.error(params.get('message')!);
    }
  }, [params]);

  const onSubmit = async (formData: SigninFormInterface) => {
    try {
      setLoading(true);
      const res = await signIn('credentials', { ...formData, redirect: false });
      if (res.error) throw new Error(res.error);
      toastMessage.success('Signed up successfully');
      setLoading(false);
      // replace('/user/search');
    } catch (err: any) {
      toastMessage.error(err?.message);
    } finally {
      setLoading(false);
    }
  };
  const session = useSession();
  useEffect(() => {
    if (session.data) {
      startTransition(()=>
      replace('/user/search'))
    }
  }, [session]);
  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        control={control}
        name='email'
        placeholder='Email'
        type='email'
      />
      <div>
        <PasswordInput
          control={control}
          name='password'
          placeholder='Password'
        />
      </div>
      <PrimaryButton type='submit' isLoading={loading||isPending} className='mt-4'>
        Sign In
      </PrimaryButton>

      <div className='flex flex-col items-center justify-center gap-5 text-sm font-medium pt-6'>
        <p className='flex items-center'>
          New user?&nbsp;
          <span
            onClick={() => push(`/auth/signup`)}
            className='text-[#0018FF] hover:cursor-pointer font-semibold'
          >
            Sign up
          </span>
        </p>
        <p className=' flex items-center -mt-2'>
          Didn’t receive any update?&nbsp;
          <span
            onClick={() =>
              window.open(
                'https://calendly.com/mrugesh-abcxchange/30min?month=2023-07',
              )
            }
            className='text-[#0018FF] hover:cursor-pointer font-semibold'
          >
            Contact Support
          </span>
        </p>
      </div>
    </form>
  );
}
