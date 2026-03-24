import { ROLES } from '@/app/generated/prisma/enums';

export interface SessionPayload {
  userId: string;
  role: ROLES;
}
