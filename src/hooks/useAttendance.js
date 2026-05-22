// src/hooks/useAttendance.js
import { useState, useEffect } from 'react';
import * as attendanceService from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';

export const useAttendance = () => {
  const { userDetails } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const calculateStatus = (checkInTime) => {
    const checkIn = new Date(checkInTime);
    const hours = checkIn.getHours();
    const minutes = checkIn.getMinutes();
    
    // Late if after 9:30 AM
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      return 'Late';
    }
    return 'Present';
  };

  const checkIn = async (verification = null, networkData = null) => {
    if (!userDetails) return { success: false, error: 'User not authenticated' };
    
    try {
      setLoading(true);
      const result = await attendanceService.checkIn(verification, networkData);
      
      if (result.success) {
        await fetchTodayAttendance();
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const checkOut = async () => {
    if (!userDetails) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);
      const result = await attendanceService.checkOut();
      
      if (result.success) {
        await fetchTodayAttendance();
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const fetchTodayAttendance = async () => {
    if (!userDetails) return;

    try {
      const result = await attendanceService.getTodayAttendance();
      if (result.success) {
        setTodayAttendance(result.data);
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  const fetchAttendanceHistory = async (month = null) => {
    if (!userDetails) return;

    try {
      setLoading(true);
      const result = await attendanceService.getAttendanceHistory(month);
      
      if (result.success) {
        setAttendanceHistory(result.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      setLoading(false);
    }
  };

  const fetchAllAttendance = async (userId = null, date = null) => {
    try {
      setLoading(true);
      const filters = {};
      
      if (userId) filters.userId = userId;
      if (date) filters.date = date;

      const result = await attendanceService.getAllAttendance(filters);
      
      setLoading(false);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchTodayAttendance();
    }
  }, [userDetails]);

  return {
    todayAttendance,
    attendanceHistory,
    loading,
    checkIn,
    checkOut,
    fetchTodayAttendance,
    fetchAttendanceHistory,
    fetchAllAttendance
  };
};
