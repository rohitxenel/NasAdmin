import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Nas Admin",
  description: "Best app ever 🚀",
  icons: {
    icon: [
      { url: "/Nas-fev.svg", type: "image/svg+xml" },
      { url: "/Nas-fev.png", sizes: "32x32" },
      { url: "/Nas-fev.png", sizes: "192x192" },
      { url: "/Nas-fev.png", sizes: "512x512" },
    ],
    apple: { url: "/Nas-fev.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          {/* ✅ Global Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: {
                style: { background: '#10b981', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#10b981' },
              },
              error: {
                style: { background: '#ef4444', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#ef4444' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}