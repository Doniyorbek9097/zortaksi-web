/** Axios / API xatosidan foydalanuvchiga ko'rsatiladigan matn */
export function getApiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  if (!error || typeof error !== 'object') return fallback;

  const e = error as {
    response?: { data?: { message?: string; errorMessage?: string } };
    code?: string;
    message?: string;
  };

  const data = e.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (data?.errorMessage && typeof data.errorMessage === 'string') return data.errorMessage;

  if (e.code === 'ECONNABORTED') {
    return 'So\'rov vaqti tugadi. Telegram sekin javob berdi — qayta urinib ko\'ring.';
  }
  if (e.message === 'Network Error') {
    return 'Server bilan aloqa yo\'q. Internet yoki API manzilini tekshiring.';
  }

  return fallback;
}

/** Auth API lar uchun uzroq timeout (Telegram ulanishi sekin bo'lishi mumkin) */
export const AUTH_API_TIMEOUT_MS = 60_000;
