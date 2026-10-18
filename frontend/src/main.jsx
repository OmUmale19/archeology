import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';

const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('clerk_publishable_key') : null;
const rawKey = (envKey || storedKey || '').trim();
const isClerkConfigured = Boolean(rawKey && rawKey.startsWith('pk_'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isClerkConfigured ? (
      <ClerkProvider publishableKey={rawKey} afterSignOutUrl="/">
        <App isClerkConfigured={true} />
      </ClerkProvider>
    ) : (
      <App isClerkConfigured={false} />
    )}
  </React.StrictMode>
);
