import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { checkInByQr } from '../services/attendanceService';
import * as authService from '../services/authService';

QrScanner.WORKER_PATH = new URL(
  'qr-scanner/qr-scanner-worker.min.js',
  import.meta.url
).toString();

const KIOSK_EMAIL = import.meta.env.VITE_KIOSK_EMAIL;
const KIOSK_PASSWORD = import.meta.env.VITE_KIOSK_PASSWORD;

const QrKiosk = () => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const cooldownRef = useRef(false);
  const [status, setStatus] = useState('Starting camera...');
  const [message, setMessage] = useState('');
  const isAlreadyMarkedError = (errorText = '') =>
    errorText.includes('Already checked in') || errorText.includes('Attendance already marked');

  const speakGreeting = (userName) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const greeting = `Hi ${userName}`;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(greeting);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const ensureKioskAuth = async () => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) return true;

    if (!KIOSK_EMAIL || !KIOSK_PASSWORD) {
      throw new Error('Kiosk credentials missing in .env');
    }

    const loginResult = await authService.login(KIOSK_EMAIL, KIOSK_PASSWORD);
    if (!loginResult.success) {
      throw new Error(loginResult.error || 'Kiosk auto sign-in failed');
    }

    return true;
  };

  const handleScan = async (result) => {
    if (!result?.data || cooldownRef.current) return;

    cooldownRef.current = true;
    setStatus('Processing QR code...');
    setMessage('');

    const qrData = result.data.trim();
    if (!qrData.includes('|')) {
      setStatus('Invalid QR code');
      setMessage('Please scan a valid Apptunix ID card.');
      cooldownRef.current = false;
      return;
    }

    const response = await checkInByQr(qrData);
    if (response.success) {
      const userName = response.data?.userName || 'there';
      setStatus('Auto check-in successful');
      setMessage(`Hi ${userName}`);
      speakGreeting(userName);
    } else if (isAlreadyMarkedError(response.error)) {
      const userName = response.data?.userName || 'there';
      setStatus('Attendance already marked');
      setMessage(`Hi ${userName}, attendance already marked.`);
      speakGreeting(`${userName}, attendance already marked`);
    } else {
      setStatus('QR check-in failed');
      setMessage(response.error || 'Please try again.');
    }

    setTimeout(() => {
      setStatus('Ready to scan');
      setMessage('Hold your QR code inside the camera view.');
      cooldownRef.current = false;
    }, 2000);
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        await ensureKioskAuth();
        if (!videoRef.current || !mounted) return;

        const scanner = new QrScanner(videoRef.current, handleScan, {
          maxScansPerSecond: 5,
          highlightScanRegion: true,
          highlightCodeOutline: true
        });

        scannerRef.current = scanner;
        await scanner.start();
        setStatus('Ready to scan');
        setMessage('Hold your QR code inside the camera view.');
      } catch (error) {
        setStatus('Camera error');
        setMessage(error.message || 'Unable to start QR scanner.');
      }
    };

    start();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">QR Check-In</p>
            <h1 className="mt-2 text-3xl font-semibold">Scan ID Card</h1>
            <p className="mt-2 text-sm text-slate-300">
              Scan the QR code on the Apptunix ID card to record attendance.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_60px_rgba(15,23,42,0.45)]">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-130 w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">System Status</p>
              <p className="mt-3 text-lg text-indigo-200">{status}</p>
              {message && (
                <div className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">Tips</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>📱 Hold the QR code steady in the camera view</li>
                <li>💡 Ensure good lighting for faster scanning</li>
                <li>✅ Attendance is recorded instantly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrKiosk;
