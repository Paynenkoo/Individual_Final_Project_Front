import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";

// Хелпер для додавання токена
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Отримати поточного юзера (/users/me)
export const getMe = async () => {
  const { data } = await axios.get(`${API_URL}/users/me`, {
    headers: authHeaders(),
  });
  return data;
};

// Огляд профілю (пости + нагороди)
export const getUserOverview = async (id) => {
  const { data } = await axios.get(`${API_URL}/users/${id}/overview`, {
    headers: authHeaders(),
  });
  return data;
};

// Оновити мій профіль
export const updateMe = async (payload) => {
  const { data } = await axios.put(`${API_URL}/users/me`, payload, {
    headers: authHeaders(),
  });
  return data;
};

// Отримати юзера по ID
export const getUserById = async (id) => {
  const { data } = await axios.get(`${API_URL}/users/${id}`, {
    headers: authHeaders(),
  });
  return data;
};

// Отримати підписників
export const getFollowers = async (id) => {
  const { data } = await axios.get(`${API_URL}/users/${id}/followers`, {
    headers: authHeaders(),
  });
  return data;
};

// Отримати тих, на кого підписаний
export const getFollowing = async (id) => {
  const { data } = await axios.get(`${API_URL}/users/${id}/following`, {
    headers: authHeaders(),
  });
  return data;
};

// Підписатися
export const followUser = async (id) => {
  const { data } = await axios.post(
    `${API_URL}/users/${id}/follow`,
    {},
    { headers: authHeaders() }
  );
  return data;
};

// Відписатися
export const unfollowUser = async (id) => {
  const { data } = await axios.post(
    `${API_URL}/users/${id}/unfollow`,
    {},
    { headers: authHeaders() }
  );
  return data;
};
