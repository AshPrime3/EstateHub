export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'PROPERTY_MANAGER' | 'MAINTENANCE_CONTRACTOR';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
