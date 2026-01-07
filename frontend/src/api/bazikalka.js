// frontend/src/api/bazikalka.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5050/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Отримати фід Bazilka (cursor pagination) */
export async function fetchBazilka({ limit = 10, before } = {}) {
  const params = {};
  if (limit) params.limit = limit;
  if (before) params.before = before;

  const { data } = await axios.get(`${API_URL}/bazilka`, { params });
  // { items, nextCursor }
  return data;
}

/** Створити пост */
export async function createPost({ topic, text }) {
  const { data } = await axios.post(
    `${API_URL}/bazilka`,
    { topic, text },
    { headers: authHeaders() }
  );
  return data; // створений пост
}

/** Тогл лайк */
export async function toggleLike(postId) {
  const { data } = await axios.post(
    `${API_URL}/bazilka/${postId}/like`,
    {},
    { headers: authHeaders() }
  );
  return {
    ok: true,
    liked: Boolean(data.liked),
    likesCount:
      typeof data.likesCount === "number" ? data.likesCount : data.likes,
  };
}

/** Додати коментар — повертає оновлений пост */
export async function addComment(postId, text) {
  const { data } = await axios.post(
    `${API_URL}/bazilka/${postId}/comments`,
    { text },
    { headers: authHeaders() }
  );
  return data;
}

/** Оновити коментар — повертає оновлений пост */
export async function updateComment(postId, commentId, text) {
  const { data } = await axios.patch(
    `${API_URL}/bazilka/${postId}/comments/${commentId}`,
    { text },
    { headers: authHeaders() }
  );
  return data;
}

/** Видалити коментар — повертає оновлений пост */
export async function deleteComment(postId, commentId) {
  const { data } = await axios.delete(
    `${API_URL}/bazilka/${postId}/comments/${commentId}`,
    { headers: authHeaders() }
  );
  return data;
}

/** Видалити пост */
export async function deletePost(postId) {
  const { data } = await axios.delete(
    `${API_URL}/bazilka/${postId}`,
    { headers: authHeaders() }
  );
  return data; // { ok: true, deletedId } або 200
}
