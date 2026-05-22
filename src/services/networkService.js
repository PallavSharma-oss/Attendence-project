import api from './api';

// Get network whitelist
export const getNetworkWhitelist = async () => {
  try {
    const response = await api.get('/network/whitelist');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Add IP to whitelist
export const addToWhitelist = async (ipRange, description) => {
  try {
    const response = await api.post('/network/whitelist', {
      ipRange,
      description
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Remove from whitelist
export const removeFromWhitelist = async (id) => {
  try {
    const response = await api.delete(`/network/whitelist/${id}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};
