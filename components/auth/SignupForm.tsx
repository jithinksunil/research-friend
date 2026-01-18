'use client';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SignupFormInterface } from '@/interfaces';
import { toastMessage } from '@/lib/toast';
import { CheckBoxInput, TextInput } from '../form';
import { PrimaryButton } from '../common';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';

const schema = yup.object().shape({
  firstName: yup.string().trim().required('Last Name is required').defined(),
  lastName: yup.string().trim().optional(),
  email: yup
    .string()
    .email('Email must be valid')
    .trim()
    .required('Email is required')
    .defined(),
  termAndPrivacyPolicy: yup.bool().defined(),
});

const defaultValues: SignupFormInterface = {
  firstName: '',
  lastName: '',
  email: '',
  termAndPrivacyPolicy: true,
};

export function SignupForm() {
  const [registering, setRegistering] = useState(false);
  const { push, replace } = useRouter();
  const { control, handleSubmit } = useForm({
    //@ts-ignore
    resolver: yupResolver(schema),
    defaultValues,
  });
  const params = useSearchParams();

  useEffect(() => {
    if (params.get('message')) {
      replace('/auth/signup');
      toastMessage.error(params.get('message')!);
    }
  }, [params]);

  const onSubmit = async (formData: SignupFormInterface) => {
    try {
      setRegistering(true);
      if (!formData.termAndPrivacyPolicy)
        throw new Error('Must agree to terms and services');
      const res = await signIn('credentials', { ...formData, redirect: false });
      if (res.error) throw new Error(res.error);
      toastMessage.success('Signed up successfully');
      setRegistering(false);
      push('/user/dashboard');
    } catch (err: any) {
      toastMessage.error(err?.message);
    } finally {
      setRegistering(false);
    }
  };
  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-5'>
        <TextInput
          control={control}
          name='firstName'
          placeholder='First Name'
        />
        <TextInput control={control} name='lastName' placeholder='Last Name' />
      </div>
      <TextInput control={control} name='email' placeholder='Email' />
      <CheckBoxInput
        labelClassName='!text-sm'
        control={control}
        name='termAndPrivacyPolicy'
        label={
          <>
            I agree to the &nbsp;
            <span
              onClick={() =>
                window.open('https://www.abcxchange.com/terms-of-service')
              }
              className='text-[#0018FF] hover:cursor-pointer font-semibold'
            >
              Terms of Service
            </span>
            &nbsp; and &nbsp;
            <span
              onClick={() =>
                window.open('https://www.abcxchange.com/privacy-policy')
              }
              className='text-[#0018FF] hover:cursor-pointer font-semibold'
            >
              Privacy Policy
            </span>
          </>
        }
      />

      <PrimaryButton type='submit' isLoading={registering}>
        Register
      </PrimaryButton>

      <div className='flex flex-col items-center justify-center gap-5 text-sm font-medium pt-6'>
        <p className='flex items-center'>
          Have an account?&nbsp;
          <span
            onClick={() => push(`/auth/signin`)}
            className='text-[#0018FF] hover:cursor-pointer font-semibold'
          >
            Sign in
          </span>
        </p>
        <p className=' flex items-center -mt-2'>
          Didn’t receive any update?&nbsp;
          <span
            onClick={() =>
              window.open(
                'https://calendly.com/mrugesh-abcxchange/30min?month=2023-07'
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
