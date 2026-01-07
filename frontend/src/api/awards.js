import api from "./axios";

// ❗️ЖОДНИХ імпортів стилів тут бути не повинно

export const fetchAwards = async () => {
  const { data } = await api.get("/awards");
  return data;
};

export const createAward = async (payload) => {
  const { data } = await api.post("/awards", payload);
  return data;
};

export const updateAward = async (id, payload) => {
  const { data } = await api.put(`/awards/${id}`, payload);
  return data;
};

export const deleteAward = async (id) => {
  const { data } = await api.delete(`/awards/${id}`);
  return data;
};
