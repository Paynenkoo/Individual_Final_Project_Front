import api from "./client";

export const getPosts = () => api.get("/posts").then(r => r.data);
export const createPost = (payload) => api.post("/posts", payload).then(r => r.data);
export const addComment = (postId, payload) =>
  api.post(`/posts/${postId}/comments`, payload).then(r => r.data);
