import api from "./axios";
export const fetchFollowers = async (userId) => (await api.get(`/users/${userId}/followers`)).data;
export const followUser = async (userId) => (await api.post(`/users/${userId}/follow`)).data;
export const unfollowUser = async (userId) => (await api.delete(`/users/${userId}/follow`)).data;
