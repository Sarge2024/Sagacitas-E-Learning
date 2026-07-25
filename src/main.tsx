import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill for crypto.randomUUID in non-secure HTTP / IP contexts
if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.crypto) {
    win.crypto = {};
  }
  if (typeof win.crypto.randomUUID !== 'function') {
    win.crypto.randomUUID = function randomUUID() {
      if (typeof win.crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        win.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (b: any) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
