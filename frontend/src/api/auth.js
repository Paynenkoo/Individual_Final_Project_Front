import api from "./axios";

// беремо токен з localStorage і формуємо Bearer
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// LOGIN
export const loginApi = async ({ emailOrUsername, password }) => {
  const { data } = await api.post("/auth/login", {
    emailOrUsername,
    password,
  });

  // зберігаємо токен
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  return data; // { token, user }
};

// REGISTER
export const registerApi = async ({ username, email, password }) => {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  // якщо бекенд повертає токен — теж зберігаємо
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  return data; // { token, user }
};

// ME
export const meApi = async () => {
  const { data } = await api.get("/auth/me", {
    headers: authHeaders(),
  });

  return data;
};
