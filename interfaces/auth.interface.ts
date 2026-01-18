import { ROLES } from '@/app/generated/prisma/enums';

export interface SignupFormInterface {
  firstName: string;
  lastName?: string | undefined;
  email: string;
  termAndPrivacyPolicy: boolean;
}

export interface SessionPayload {
  userId: string;
  role: ROLES;
}
