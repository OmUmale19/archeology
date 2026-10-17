import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(PUBLISHABLE_KEY && PUBLISHABLE_KEY.trim().startsWith('pk_'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isClerkConfigured ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY.trim()} afterSignOutUrl="/">
        <App isClerkConfigured={true} />
      </ClerkProvider>
    ) : (
      <App isClerkConfigured={false} />
    )}
  </React.StrictMode>
);
