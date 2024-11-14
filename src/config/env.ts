export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
} as const;

// Validate environment variables
if (!env.apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
} 