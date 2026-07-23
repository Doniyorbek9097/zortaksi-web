/** Barcha auth_token useCookie chaqiriqlari bir xil opts ishlatishi kerak */
export const authCookieOptions = {
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
  watch: true as const,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}
