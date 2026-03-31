export interface SignupFormInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termAndPrivacyPolicy: boolean;
}

export interface SigninFormInterface {
  password: string;
  email: string;
}
