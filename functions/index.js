const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');

admin.initializeApp();

const db = admin.firestore();

const formatDate = (date) => date.toISOString().split('T')[0];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const hours = Math.abs(end - start) / 36e5;
  return Number.isFinite(hours) ? hours : 0;
};

const summarizeUser = ({
  userName,
  windowDays,
  uniqueDays,
  consistencyScore,
  lateRate,
  latenessTrend,
  overtimeAverage,
  absenteeRisk,
}) => {
  const latePercent = Math.round(lateRate * 100);
  const overtimeText = overtimeAverage > 0 ? `${overtimeAverage.toFixed(1)}h avg overtime` : 'no significant overtime';
  const trendText = latenessTrend === 'improving'
    ? 'late arrivals are improving'
    : latenessTrend === 'worsening'
      ? 'late arrivals are increasing'
      : 'late arrivals are stable';

  return `${userName} attended ${uniqueDays}/${windowDays} days (consistency ${consistencyScore}%). ${trendText} (${latePercent}% late). ${overtimeText}. Absentee risk score: ${absenteeRisk}/100.`;
};

const buildAnomalies = ({ consistencyScore, lateRate, overtimeAverage, absenteeRisk }) => {
  const anomalies = [];

  if (absenteeRisk >= 70) {
    anomalies.push({
      type: 'absentee_risk',
      severity: 'high',
      message: 'High absentee risk detected.'
    });
  }

  if (consistencyScore <= 60) {
    anomalies.push({
      type: 'low_consistency',
      severity: 'medium',
      message: 'Low attendance consistency over the last 30 days.'
    });
  }

  if (lateRate >= 0.3) {
    anomalies.push({
      type: 'late_arrivals',
      severity: 'medium',
      message: 'Frequent late arrivals detected.'
    });
  }

  if (overtimeAverage >= 2) {
    anomalies.push({
      type: 'overtime_spike',
      severity: 'low',
      message: 'Sustained overtime above 2 hours/day.'
    });
  }

  return anomalies;
};

exports.generateAttendanceInsights = onSchedule(
  {
    schedule: '30 23 * * *',
    timeZone: 'Asia/Kolkata',
  },
  async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);

    const windowStart = formatDate(startDate);
    const windowEnd = formatDate(endDate);
    const windowDays = 30;

    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const attendanceSnapshot = await db
      .collection('attendance')
      .where('date', '>=', windowStart)
      .where('date', '<=', windowEnd)
      .get();

    const attendanceByUser = new Map();

    attendanceSnapshot.forEach((doc) => {
      const record = doc.data();
      const userId = record.userId;
      if (!userId) return;

      if (!attendanceByUser.has(userId)) {
        attendanceByUser.set(userId, []);
      }
      attendanceByUser.get(userId).push(record);
    });

    const batch = db.batch();

    users.forEach((user) => {
      if (user.isActive === false) return;

      const userId = user.uid || user.id;
      if (!userId) return;

      const records = attendanceByUser.get(userId) || [];
      const uniqueDays = new Set(records.map((r) => r.date)).size;

      const lateRecords = records.filter((record) => record.status === 'Late');
      const lateRate = records.length ? lateRecords.length / records.length : 0;

      const last7Start = new Date(endDate);
      last7Start.setDate(endDate.getDate() - 6);
      const prev7Start = new Date(endDate);
      prev7Start.setDate(endDate.getDate() - 13);

      const last7StartStr = formatDate(last7Start);
      const prev7StartStr = formatDate(prev7Start);
      const last7EndStr = formatDate(endDate);
      const prev7EndStr = formatDate(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7));

      const last7 = records.filter((record) => record.date >= last7StartStr && record.date <= last7EndStr);
      const prev7 = records.filter((record) => record.date >= prev7StartStr && record.date <= prev7EndStr);

      const last7LateRate = last7.length ? last7.filter((r) => r.status === 'Late').length / last7.length : 0;
      const prev7LateRate = prev7.length ? prev7.filter((r) => r.status === 'Late').length / prev7.length : 0;

      const latenessDelta = last7LateRate - prev7LateRate;
      const latenessTrend = latenessDelta > 0.1 ? 'worsening' : latenessDelta < -0.1 ? 'improving' : 'stable';

      const overtimeValues = records.map((record) => {
        const hours = calculateHours(record.checkIn, record.checkOut);
        return Math.max(0, hours - 8);
      });
      const overtimeAverage = overtimeValues.length
        ? overtimeValues.reduce((sum, value) => sum + value, 0) / overtimeValues.length
        : 0;

      const consistencyScore = Math.round((uniqueDays / windowDays) * 100);
      const absenceRate = 1 - uniqueDays / windowDays;
      const overtimeFactor = clamp(overtimeAverage / 3, 0, 1);
      const absenteeRisk = Math.round(
        clamp(absenceRate * 70 + lateRate * 20 + overtimeFactor * 10, 0, 100)
      );

      const anomalies = buildAnomalies({
        consistencyScore,
        lateRate,
        overtimeAverage,
        absenteeRisk,
      });

      const summary = summarizeUser({
        userName: user.name || 'Employee',
        windowDays,
        uniqueDays,
        consistencyScore,
        lateRate,
        latenessTrend,
        overtimeAverage,
        absenteeRisk,
      });

      const insight = {
        userId,
        userName: user.name || 'Employee',
        userEmail: user.email || null,
        department: user.department || 'Unassigned',
        windowStart,
        windowEnd,
        metrics: {
          consistencyScore,
          latenessTrend,
          overtimeAverage: Number(overtimeAverage.toFixed(2)),
          absenteeRisk,
        },
        stats: {
          lateRate: Number((lateRate * 100).toFixed(1)),
          attendanceDays: uniqueDays,
          totalDays: windowDays,
        },
        anomalies,
        summary,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = db.collection('attendanceInsights').doc(userId);
      batch.set(docRef, insight, { merge: true });
    });

    await batch.commit();
  }
);
