// Dynamic API base URL resolver
// - In development (local dev): resolves to http://localhost:5000
// - In production (cPanel build): resolves to relative path (empty string) to hit the same domain
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : '');
