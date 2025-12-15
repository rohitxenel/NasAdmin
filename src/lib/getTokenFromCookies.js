'use client';

export function getTokenFromCookies() {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp('(^| )auth-token=([^;]+)'));
  return match ? match[2] : null;
}
