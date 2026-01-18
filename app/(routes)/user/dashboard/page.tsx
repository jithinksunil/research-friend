import { auth } from '@/auth';

async function page() {
  const x=await auth()
  
  return <div>{JSON.stringify(x)}</div>;
}

export default page;
