export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  posisi?: string;
  nrp?: number;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  nrp?: number;
  posisi?: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This only decodes the token, it doesn't verify the signature
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Extract user information from decoded token
 */
function extractUserFromToken(decoded: DecodedToken, userData?: any): User {
  return {
    id: decoded.userId,
    email: decoded.email,
    name: userData?.name || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || decoded.email,
    firstName: userData?.firstName,
    lastName: userData?.lastName,
    phoneNumber: userData?.phoneNumber,
    role: decoded.role,
    posisi: decoded.posisi || userData?.posisi,
    nrp: decoded.nrp || userData?.nrp,
  };
}

export function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') || undefined;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  // Decode token and extract user information
  const decoded = decodeToken(token);
  if (decoded) {
    const user = extractUserFromToken(decoded);
    setUser(user);
  }
}

export function setTokenAndUser(token: string, userData?: any): void {
  if (typeof window === 'undefined') return;
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  // Decode token and merge with user data from API
  const decoded = decodeToken(token);
  if (decoded) {
    const user = extractUserFromToken(decoded, userData);
    setUser(user);
  } else if (userData) {
    // Fallback: use user data from API if token decode fails
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      posisi: userData.posisi,
      nrp: userData.nrp,
    });
  }
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    // Try to get user from token if user not in localStorage
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        const user = extractUserFromToken(decoded);
        setUser(user);
        return user;
      }
    }
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

export function logout(): void {
  removeToken();
  removeUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

