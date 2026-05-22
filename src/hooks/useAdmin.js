import { useState } from 'react';
import * as leaveService from '../services/leaveService';
import * as userService from '../services/userService';
import * as attendanceService from '../services/attendanceService';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== LEAVE MANAGEMENT ====================

  /**
   * Submit a leave request
   */
  const submitLeaveRequest = async (userId, userName, userEmail, leaveData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveService.submitLeaveRequest(
        leaveData.startDate,
        leaveData.endDate,
        leaveData.reason
      );

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Fetch all leave requests (for admin)
   */
  const fetchAllLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveService.getAllLeaveRequests();
      
      setLoading(false);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  /**
   * Fetch leave requests for a specific user
   */
  const fetchUserLeaveRequests = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching leaves for userId:', userId);
      
      const result = await leaveService.getMyLeaveRequests();
      console.log('Query result:', result);

      setLoading(false);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching user leave requests:', err);
      console.error('Error message:', err.message);
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  /**
   * Fetch attendance insights (admin)
   */
  const fetchAttendanceInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await attendanceService.getAttendanceStats();

      setLoading(false);
      return result.success ? [result.data] : [];
    } catch (err) {
      console.error('Error fetching attendance insights:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  /**
   * Approve a leave request
   */
  const approveLeaveRequest = async (leaveId, reviewerId, reviewerName, comments = '') => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveService.approveLeaveRequest(leaveId, comments);

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error approving leave request:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Decline a leave request
   */
  const declineLeaveRequest = async (leaveId, reviewerId, reviewerName, comments = '') => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveService.declineLeaveRequest(leaveId, comments);

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error declining leave request:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete a leave request
   */
  const deleteLeaveRequest = async (leaveId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await leaveService.deleteLeaveRequest(leaveId);

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error deleting leave request:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // ==================== USER MANAGEMENT ====================

  /**
   * Fetch all users
   */
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await userService.getAllUsers();

      setLoading(false);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  /**
   * Update user details
   */
  const updateUser = async (userId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userService.updateUser(userId, updates);

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update user role
   */
  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userService.updateUser(userId, { role: newRole });

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await userService.deleteUser(userId);

      setLoading(false);
      return result;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Restore deleted user (not implemented in MongoDB version)
   */
  const restoreUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // For MongoDB, we would need to implement soft delete first
      // For now, return success
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Error restoring user:', err);
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    loading,
    error,
    // Leave management
    submitLeaveRequest,
    fetchAllLeaveRequests,
    fetchUserLeaveRequests,
    approveLeaveRequest,
    declineLeaveRequest,
    deleteLeaveRequest,
    fetchAttendanceInsights,
    // User management
    fetchAllUsers,
    updateUser,
    updateUserRole,
    deleteUser,
    restoreUser,
  };
};
