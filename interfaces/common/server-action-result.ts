export type ServerActionResult<T> =
  | {
      error: Error;
      okay: false;
    }
  | { data: T; okay: true };
