import api from "./axios";

// LOGIN
export const loginApi = async ({ emailOrUsername, password }) => {
  const { data } = await api.post("/auth/login", {
    emailOrUsername,
    password,
  });

  // 🔥 КЛЮЧОВЕ
  localStorage.setItem("token", data.token);

  return data;
};

// REGISTER
export const registerApi = async ({ username, email, password }) => {
  const { data } = await api.post("/auth/register", {
    username,
    email,
    password,
  });

  return data;
};

// ME
export const meApi = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
