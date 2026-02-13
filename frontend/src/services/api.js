const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiRequest("/auth/profile"),

  updateProfile: (profileData) =>
    apiRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  changePassword: (passwordData) =>
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    }),
};

// Posts API
export const postsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/posts${queryString ? `?${queryString}` : ""}`);
  },

  getBySlug: (slug) => apiRequest(`/posts/${slug}`),

  create: (postData) =>
    apiRequest("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    }),

  update: (id, postData) =>
    apiRequest(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    }),

  publish: (id) =>
    apiRequest(`/posts/${id}/publish`, {
      method: "PATCH",
    }),

  unpublish: (id) =>
    apiRequest(`/posts/${id}/unpublish`, {
      method: "PATCH",
    }),

  delete: (id) =>
    apiRequest(`/posts/${id}`, {
      method: "DELETE",
    }),
};

// Comments API
export const commentsAPI = {
  getByPost: (postId) => apiRequest(`/comments/post/${postId}`),

  create: (commentData) =>
    apiRequest("/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  update: (id, content) =>
    apiRequest(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),

  delete: (id) =>
    apiRequest(`/comments/${id}`, {
      method: "DELETE",
    }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest("/categories"),

  getBySlug: (slug) => apiRequest(`/categories/${slug}`),

  create: (categoryData) =>
    apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  update: (id, categoryData) =>
    apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  delete: (id) =>
    apiRequest(`/categories/${id}`, {
      method: "DELETE",
    }),
};

// Tags API
export const tagsAPI = {
  getAll: () => apiRequest("/tags"),

  getBySlug: (slug) => apiRequest(`/tags/${slug}`),

  create: (tagData) =>
    apiRequest("/tags", {
      method: "POST",
      body: JSON.stringify(tagData),
    }),

  update: (id, tagData) =>
    apiRequest(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(tagData),
    }),

  delete: (id) =>
    apiRequest(`/tags/${id}`, {
      method: "DELETE",
    }),
};

export default {
  auth: authAPI,
  posts: postsAPI,
  comments: commentsAPI,
  categories: categoriesAPI,
  tags: tagsAPI,
};
