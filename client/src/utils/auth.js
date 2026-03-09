const TOKEN_KEY = 'gao_admin_token';
const ADMIN_KEY = 'gao_admin';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token, admin) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};
export const getAdmin = () => {
  try {
    const s = localStorage.getItem(ADMIN_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
