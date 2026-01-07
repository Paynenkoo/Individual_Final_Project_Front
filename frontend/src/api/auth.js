import api from "./axios"; // ✅ використовуємо інстанс з withCredentials

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// логін
export const loginApi = async ({ emailOrUsername, password }) => {
  const { data } = await api.post(
    "/auth/login",
    { emailOrUsername, password },
    {
      headers: {
        ...authHeaders(),
        "Cache-Control": "no-store", // ✅ щоб браузер не кешував
      },
    }
  );
  return data;
};

// реєстрація
export const registerApi = async ({ username, email, password }) => {
  const { data } = await api.post(
    "/auth/register",
    { username, email, password },
    {
      headers: {
        ...authHeaders(),
        "Cache-Control": "no-store",
      },
    }
  );
  return data;
};

// поточний юзер
export const meApi = async () => {
  const { data } = await api.get("/auth/me", {
    headers: {
      ...authHeaders(),
      "Cache-Control": "no-store", // ✅ прибираємо 304/кеш
      Pragma: "no-cache",
    },
  });
  return data;
};
