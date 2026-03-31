'use client';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { SigninFormInterface } from '@/interfaces';
import { toastMessage } from '@/lib/toast';
import { TOKEN_NAMES } from '@/lib/enum';
import { useLoginMutation } from '@/hooks/user/auth';
import { PasswordInput, TextInput } from '../form';
import { PrimaryButton } from '../common';

const schema = yup.object().shape({
  password: yup.string().trim().required('Password is required').defined(),
  email: yup.string().email('Email must be valid').trim().required('Email is required').defined(),
});

const defaultValues: SigninFormInterface = {
  password: '',
  email: '',
};

export function SigninForm() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<SigninFormInterface>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const params = useSearchParams();
  const loginMutation = useLoginMutation();

  useEffect(() => {
    const message = params.get('message');
    if (message) {
      router.replace('/');
      toastMessage.error(message);
    }
  }, [params, router]);

  const onSubmit = async (formData: SigninFormInterface) => {
    try {
      const payload = await loginMutation.mutateAsync(formData);
      const refreshToken = payload?.data?.refreshToken;
      if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new Error('Refresh token missing in login response');
      }
      localStorage.setItem(TOKEN_NAMES.REFRESH_TOKEN, refreshToken);
      toastMessage.success('Signed in successfully');
      router.replace('/user/search');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toastMessage.error(message);
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <TextInput control={control} name="email" placeholder="Email" type="email" />
      <div>
        <PasswordInput control={control} name="password" placeholder="Password" />
      </div>
      <PrimaryButton type="submit" isLoading={loginMutation.isPending} className="mt-4">
        Sign In
      </PrimaryButton>

      <div className="flex flex-col items-center justify-center gap-5 text-sm font-medium pt-6">
        <p className="flex items-center">
          New user?&nbsp;
          <span
            onClick={() => router.push(`/auth/signup`)}
            className="text-[#0018FF] hover:cursor-pointer font-semibold"
          >
            Sign up
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
