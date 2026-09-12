export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  hcaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!,
} as const;

if (!env.apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

if (!env.hcaptchaSiteKey) {
  throw new Error('NEXT_PUBLIC_HCAPTCHA_SITEKEY is not defined');
}
