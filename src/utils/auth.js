import jwtDecode from 'jwt-decode';

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // Check if token has expired
  } catch (err) {
    return false; // Invalid token
  }
};
