// services/authSignupService.js
import { API_BASE_URL } from '@/lib/apiConfig';
import { authorizedFetch } from '@/lib/apiClient';


// Public APIs (without auth)
export async function sendSignupOtp(phone, email) {
  const res = await fetch(`${API_BASE_URL}/agent/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
  return data;
}

export async function verifyPhoneOtp(phone, otp, type) {
  const res = await fetch(`${API_BASE_URL}/agent/verifyPhone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, PhoneOtp: otp, type }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Phone OTP verification failed');
  return data;
}

export async function verifyEmailOtp(phone, email, otp, password) {
  const res = await fetch(`${API_BASE_URL}/agent/verifyEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, email, emailOtp: otp, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Email OTP verification failed');
  return data;
}



