'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/apiConfig';
import { authorizedFetch } from '@/lib/apiClient'
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('auth-user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse auth-user from localStorage', err);
        localStorage.removeItem('auth-user'); // clean it up if corrupted
      }
    }
  }, []);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log("Data res" , res)
      

      const resData = await res.json();
      console.log("-----------------" ,resData)
      if (!resData.status) {
        throw new Error('Invalid credentials');
      }
      const { Id, Token } = resData.data;

      // Call /getprofile using accessToken
      // const profileRes = await fetch(`${API_BASE_URL}/agent/getpofile`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${Token}`,
      //   },
      // });

      // if (!profileRes.ok) {
      //   throw new Error('Failed to fetch profile');
      // }

      // const profileData = await profileRes.json();

      const userInfo = {
        id: Id,
        email,
        // profile: profileData.data, // assuming profile is under .data
      };

      localStorage.setItem('auth-user', JSON.stringify(userInfo));
      document.cookie = `auth-token=${Token}; path=/`;

      setUser(userInfo);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const logoutRes = await authorizedFetch(`/admin/logout`, {
      method: "POST",
    });
    console.log("logoutRes", logoutRes)

    if (logoutRes.statusCode === 200 && logoutRes.status === true) {
      document.cookie = 'auth-token=; Max-Age=0; path=/';
      localStorage.removeItem('auth-user');
      setUser(null);
      router.push('/');
    }
    else {
      console.log('error')
      return
    }
  }
    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => useContext(AuthContext);
