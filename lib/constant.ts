export const productName = 'AI.Fred Research Assistant';
export const unauthorizedMessage = 'Unauthorized';
export const forbiddenMessage = 'Forbidden';
export const ACCESS_TOKEN_EXPIRATION_S = 60 * 30; //30 minutes
export const REFRESH_TOKEN_EXPIRATION_S = 60 * 60 * 24 * 30; //30 days
export const brandingColors = {
  primary: '#6F0652',
  secondary: '#F9E7EA',
  background: '#FFFFFF',
  foreground: '#171717',
  // background: '#171717',
  // foreground: '#FFFFFF',
};
export const SYSTEM_PROMPT = `
You are a senior equity research analyst at a global investment bank.

Rules:
- Use only verified public information
- Be conservative with assumptions
- Separate facts vs estimates
- Output JSON ONLY
- Follow the schema strictly
`;