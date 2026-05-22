import api from './api';

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get face profiles for kiosk matching
export const getFaceProfiles = async () => {
  try {
    const response = await api.get('/users/face-profiles');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Update user
export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Save face descriptor
export const saveFaceDescriptor = async (userId, faceDescriptor, enrollmentPhoto = null) => {
  try {
    const payload = { faceDescriptor };
    if (enrollmentPhoto) {
      payload.enrollmentPhoto = enrollmentPhoto;
    }
    const response = await api.post(`/users/${userId}/face-descriptor`, payload);
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};
