import { api } from './api';

export const officeService = {
  // Get all offices
  getAllOffices: async () => {
    try {
      const response = await api.get('/offices');
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Get office by ID
  getOfficeById: async (officeId) => {
    try {
      const response = await api.get(`/offices/${officeId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Create new office
  createOffice: async (officeData) => {
    try {
      const response = await api.post('/offices', officeData);
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Update office
  updateOffice: async (officeId, officeData) => {
    try {
      const response = await api.put(`/offices/${officeId}`, officeData);
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Delete office
  deleteOffice: async (officeId) => {
    try {
      const response = await api.delete(`/offices/${officeId}`);
      return response.data;
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  },

  // Check if user is within office geofence
  isWithinGeofence: (userLat, userLon, officeLat, officeLon, radiusMeters) => {
    const R = 6371; // Earth's radius in km
    const dLat = (officeLat - userLat) * Math.PI / 180;
    const dLon = (officeLon - userLon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(officeLat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Convert to meters
    return distance <= radiusMeters;
  }
};

export default officeService;
