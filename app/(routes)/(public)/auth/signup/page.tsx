import { SignupForm } from '@/components/auth/SignupForm';
import { AuthLayout } from '@/components/layouts';
import { productName } from '@/lib';

function page() {
  return (
    <AuthLayout>
      <div
        className={`w-full max-w-[464px] hidden 1.5md:flex flex-col justify-start bg-cover col-[1/5] text-white pt-[78px] pb-1 px-8 bg-no-repeat bg-bottom bg-[url(/assets/loginImage.webp)]`}
      >
        <p className='[&>p]:font-bold [&>p]:leading-[35px] [&>p]:text-2xl'>
          <span>
            Welcome to
            <br />
            {productName}
          </span>
        </p>
      </div>
      <div
        className={`w-full px-8 py-10 1.5md:p-0 rounded-t-xl 1.5md:rounded-none text-[#222237] col-[6/-2] flex flex-col justify-center auth-right-container`}
      >
        <h3 className='text-[20px] 1.5md:text-[33px] font-medium min-h'>
          Get Started with {productName} today
        </h3>
        <p className='pt-2 pb-8 px-0 text-sm not-italic font-normal leading-[18px] 1.5md:pt-4 1.5md:pb-10'>
          Efficiently review 1000s of applications within minutes using our
          proprietary algorithm through {productName}
        </p>
        <SignupForm />
      </div>
    </AuthLayout>
  );
}

export default page;
