'use client';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toastMessage } from '@/lib/toast';
import { TOKEN_NAMES } from '@/lib/enum';
import { CheckBoxInput, PasswordInput, TextInput } from '../form';
import { PrimaryButton } from '../common';

const schema = yup.object().shape({
  firstName: yup.string().trim().required('First Name is required').defined(),
  password: yup.string().trim().required('Password is required').defined(),
  lastName: yup.string().trim().defined(),
  email: yup.string().email('Email must be valid').trim().required('Email is required').defined(),
  termAndPrivacyPolicy: yup.bool().defined(),
});

type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termAndPrivacyPolicy: boolean;
};

const defaultValues: SignupFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  termAndPrivacyPolicy: true,
};

export function SignupForm() {
  const [registering, setRegistering] = useState(false);
  const router = useRouter();
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const params = useSearchParams();

  useEffect(() => {
    const message = params.get('message');
    if (message) {
      router.replace('/auth/signup');
      toastMessage.error(message);
    }
  }, [params, router]);

  const onSubmit = async (formData: SignupFormValues) => {
    try {
      setRegistering(true);
      if (!formData.termAndPrivacyPolicy) throw new Error('Must agree to terms and services');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload?.message === 'string' ? payload.message : 'Sign up failed');
      }
      const refreshToken = payload?.data?.refreshToken;
      if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new Error('Refresh token missing in register response');
      }
      localStorage.setItem(TOKEN_NAMES.REFRESH_TOKEN, refreshToken);
      toastMessage.success('Signed up successfully');
      router.replace('/user/search');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toastMessage.error(message);
    } finally {
      setRegistering(false);
    }
  };
  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <TextInput control={control} name="firstName" placeholder="First Name" />
        <TextInput control={control} name="lastName" placeholder="Last Name" />
      </div>
      <TextInput control={control} name="email" placeholder="Email" />
      <PasswordInput control={control} name="password" placeholder="Password" />
      <CheckBoxInput
        labelClassName="!text-sm"
        control={control}
        name="termAndPrivacyPolicy"
        label={
          <>
            I agree to the &nbsp;
            <span
              onClick={() => window.open('https://www.abcxchange.com/terms-of-service')}
              className="text-[#0018FF] hover:cursor-pointer font-semibold"
            >
              Terms of Service
            </span>
            &nbsp; and &nbsp;
            <span
              onClick={() => window.open('https://www.abcxchange.com/privacy-policy')}
              className="text-[#0018FF] hover:cursor-pointer font-semibold"
            >
              Privacy Policy
            </span>
          </>
        }
      />

      <PrimaryButton type="submit" isLoading={registering}>
        Register
      </PrimaryButton>

      <div className="flex flex-col items-center justify-center gap-5 text-sm font-medium pt-6">
        <p className="flex items-center">
          Have an account?&nbsp;
          <span
            onClick={() => router.push(`/`)}
            className="text-[#0018FF] hover:cursor-pointer font-semibold"
          >
            Sign in
          </span>
        </p>
        <p className=" flex items-center -mt-2">
          Didn’t receive any update?&nbsp;
          <span
            onClick={() =>
              window.open('https://calendly.com/mrugesh-abcxchange/30min?month=2023-07')
            }
            className="text-[#0018FF] hover:cursor-pointer font-semibold"
          >
            Contact Support
          </span>
        </p>
      </div>
    </form>
  );
}
