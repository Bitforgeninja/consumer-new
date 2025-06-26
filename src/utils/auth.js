import jwtDecode from 'jwt-decode';

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      console.warn('❌ Token expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Invalid token:', error.message);
    return false;
  }
};
