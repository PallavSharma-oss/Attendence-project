import api from './api';

// Check in
export const checkIn = async (verification = null, networkData = null, userId = null) => {
  try {
    const response = await api.post('/attendance/checkin', {
      verification,
      networkData,
      userId
    });
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Check in via QR
export const checkInByQr = async (qrData) => {
  try {
    const response = await api.post('/attendance/qr-checkin', { qrData });
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      data: error.response?.data?.data || null
    };
  }
};

// Check out
export const checkOut = async () => {
  try {
    const response = await api.put('/attendance/checkout');
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get today's attendance
export const getTodayAttendance = async () => {
  try {
    const response = await api.get('/attendance/today');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get attendance history
export const getAttendanceHistory = async (month = null) => {
  try {
    const params = month ? { month } : {};
    const response = await api.get('/attendance/history', { params });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get all attendance (admin)
export const getAllAttendance = async (filters = {}) => {
  try {
    const response = await api.get('/attendance/all', { params: filters });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get attendance stats (admin)
export const getAttendanceStats = async () => {
  try {
    const response = await api.get('/attendance/stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};
