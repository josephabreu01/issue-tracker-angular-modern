export interface User {
  username: string;
  role: 'admin' | 'generic';
  token?: string; // No esta en uso 
  password : string;
}