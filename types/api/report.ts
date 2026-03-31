export type EnhanceHandler = (
  symbol: string,
  improvementNeeded: string,
) => Promise<{
  okay: boolean;
  data?: unknown;
  error?: { message?: string };
}>;
