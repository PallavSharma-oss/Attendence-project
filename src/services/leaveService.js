import api from './api';

// Submit leave request
export const submitLeaveRequest = async (startDate, endDate, reason) => {
  try {
    const response = await api.post('/leave', {
      startDate,
      endDate,
      reason
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get my leave requests
export const getMyLeaveRequests = async () => {
  try {
    const response = await api.get('/leave/my-requests');
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Get all leave requests (admin)
export const getAllLeaveRequests = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/leave/all', { params });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Approve leave request
export const approveLeaveRequest = async (leaveId, comments = '') => {
  try {
    const response = await api.put(`/leave/${leaveId}/approve`, { comments });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Decline leave request
export const declineLeaveRequest = async (leaveId, comments = '') => {
  try {
    const response = await api.put(`/leave/${leaveId}/decline`, { comments });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};

// Delete leave request
export const deleteLeaveRequest = async (leaveId) => {
  try {
    const response = await api.delete(`/leave/${leaveId}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
};
