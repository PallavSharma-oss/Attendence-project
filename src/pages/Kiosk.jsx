import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '../face/loadModels';
import { captureDescriptor } from '../face/captureDescriptor';
import { matchFace } from '../face/matchFace';
import { getFaceProfiles } from '../services/userService';
import { checkIn as checkInAPI } from '../services/attendanceService';
import * as authService from '../services/authService';

let cachedKioskVoice = null;
let voiceListenerAttached = false;

const pickKioskVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferredNames = [
    'Microsoft Heera',
    'Microsoft Zira',
    'Google UK English Female',
    'Samantha',
    'Karen',
    'Moira',
    'Veena'
  ];

  const lowerNameMatch = (voice, needle) =>
    voice.name.toLowerCase().includes(needle.toLowerCase());

  for (const preferred of preferredNames) {
    const match = voices.find((voice) => lowerNameMatch(voice, preferred));
    if (match) return match;
  }

  const femaleLike = voices.find((voice) =>
    /female|woman|zira|heera|samantha|karen|moira|veena/i.test(voice.name)
  );
  if (femaleLike) return femaleLike;

  return voices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) || voices[0];
};

const getKioskVoice = () => {
  if (cachedKioskVoice) return cachedKioskVoice;
  cachedKioskVoice = pickKioskVoice();
  return cachedKioskVoice;
};

// Voice announcer utility
const speakMessage = (message) => {
  if (!('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  const utterance = new SpeechSynthesisUtterance(message);
  
  const kioskVoice = getKioskVoice();
  if (kioskVoice) {
    utterance.voice = kioskVoice;
  }
  
  utterance.lang = 'en-IN';
  utterance.rate = 0.85; // Slower for romantic tone
  utterance.pitch = 1.3; // Higher pitch for sweet voice
  utterance.volume = 1;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
};

const KIOSK_EMAIL = import.meta.env.VITE_KIOSK_EMAIL;
const KIOSK_PASSWORD = import.meta.env.VITE_KIOSK_PASSWORD;

const STATUS_COPY = {
  init: 'Initializing kiosk...',
  loading: 'Loading face models...',
  camera: 'Starting camera...',
  scanning: 'Stand in front of the camera',
  noface: 'No face detected',
  matched: 'Match found. Recording attendance...',
  success: 'Attendance recorded',
  duplicate: 'Attendance already marked',
  error: 'Kiosk error. Please contact admin.',
};

const MATCH_THRESHOLD = 0.5; // Balanced threshold for reliable matches
const MIN_FACE_SIZE = 50; // Minimal requirement, detect any face
const REQUIRED_MATCHES = 1; // Instant match
const SCAN_INTERVAL_MS = 120;

const Kiosk = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastScanRef = useRef(0);
  const cooldownRef = useRef(false);
  const matchStreakRef = useRef({ userId: null, count: 0 });
  const statusRef = useRef('init');
  const messageRef = useRef('');
  const usersRef = useRef([]);
  const markedTodayRef = useRef(new Set());
  const [status, setStatus] = useState('init');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [markedToday, setMarkedToday] = useState(() => new Set());
  const [cameraError, setCameraError] = useState('');
  const [matchedUser, setMatchedUser] = useState(null);

  const updateStatus = (nextStatus) => {
    if (statusRef.current === nextStatus) return;
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const updateMessage = (nextMessage) => {
    if (messageRef.current === nextMessage) return;
    messageRef.current = nextMessage;
    setMessage(nextMessage);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraError('');
    updateStatus('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 540 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setupCanvas();
      }
      updateStatus('scanning');
    } catch (error) {
      setCameraError('Camera access blocked. Please allow camera permissions.');
      updateStatus('error');
    }
  };

  const requestFullScreen = () => {
    if (document.fullscreenElement) return;
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => undefined);
    }
  };

  const drawDetectionBox = (detection) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get video display size
    const videoRect = video.getBoundingClientRect();
    const displayWidth = videoRect.width;
    const displayHeight = videoRect.height;
    
    // Get actual video resolution
    const videoActualWidth = video.videoWidth;
    const videoActualHeight = video.videoHeight;
    
    // Calculate scale factors
    const scaleX = displayWidth / videoActualWidth;
    const scaleY = displayHeight / videoActualHeight;
    
    // Get detection box from face-api (based on actual video resolution)
    const { x, y, width, height } = detection.detection.box;
    
    // Scale coordinates to display size
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw green rectangle around face
    ctx.strokeStyle = '#10b981'; // Emerald green
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
    
    // Draw corner brackets
    const cornerLength = 20;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY + cornerLength);
    ctx.lineTo(scaledX, scaledY);
    ctx.lineTo(scaledX + cornerLength, scaledY);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY);
    ctx.lineTo(scaledX + scaledWidth, scaledY);
    ctx.lineTo(scaledX + scaledWidth, scaledY + cornerLength);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY + scaledHeight - cornerLength);
    ctx.lineTo(scaledX, scaledY + scaledHeight);
    ctx.lineTo(scaledX + cornerLength, scaledY + scaledHeight);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
    ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
    ctx.lineTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
    ctx.stroke();
  };

  const setupCanvas = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video display size, not resolution
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  const loadUsers = async () => {
    const result = await getFaceProfiles();
    if (result.success) {
      const data = result.data.filter((user) => Array.isArray(user.faceDescriptor));
      usersRef.current = data;
      setUsers(data);
      if (data.length === 0) {
        updateStatus('error');
        updateMessage('No enrolled users found. Enroll faces first.');
      }
    } else {
      updateStatus('error');
      updateMessage(result.error || 'Unable to load enrolled users.');
    }
  };

  const ensureKioskAuth = async () => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      return true;
    }

    if (!KIOSK_EMAIL || !KIOSK_PASSWORD) {
      throw new Error('Kiosk credentials missing in .env');
    }

    const loginResult = await authService.login(KIOSK_EMAIL, KIOSK_PASSWORD);
    if (!loginResult.success) {
      throw new Error(loginResult.error || 'Kiosk auto sign-in failed');
    }

    return true;
  };

  const markAttendance = async (user) => {
    const userId = user._id || user.id || user.uid;

    if (!userId) {
      updateStatus('error');
      updateMessage('Matched user ID missing. Please contact admin.');
      return;
    }

    if (markedTodayRef.current.has(userId)) {
      updateStatus('duplicate');
      updateMessage(`Hi ${user.name}, attendance already marked.`);
      setMatchedUser(user);
      speakMessage(`Hi ${user.name}, attendance already marked`);
      return;
    }

    // Use API to check and record attendance
    const result = await checkInAPI({
      matchScore: 0.9 // High confidence for kiosk
    }, null, userId);

    if (!result.success) {
      const errorMessage = result.error || 'Error recording attendance.';
      if (errorMessage.includes('Already checked in')) {
        setMarkedToday((prev) => {
          const next = new Set(prev);
          next.add(userId);
          markedTodayRef.current = next;
          return next;
        });
        updateStatus('duplicate');
        updateMessage(`Hi ${user.name}, attendance already marked.`);
        setMatchedUser(user);
        speakMessage(`Hi ${user.name}, attendance already marked`);
      } else {
        updateStatus('error');
        updateMessage(errorMessage);
      }
      return;
    }

    setMarkedToday((prev) => {
      const next = new Set(prev);
      next.add(userId);
      markedTodayRef.current = next;
      return next;
    });
    updateStatus('success');
    updateMessage(`Welcome, ${user.name}. Attendance Recorded.`);
    setMatchedUser(user);
    speakMessage(`Hi ${user.name}, attendance recorded`);
  };

  const scanLoop = async () => {
    if (!videoRef.current || cooldownRef.current) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || usersRef.current.length === 0) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const now = Date.now();
    if (now - lastScanRef.current < SCAN_INTERVAL_MS) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }
    lastScanRef.current = now;

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 128, // Minimal for speed
      scoreThreshold: 0.20, // Ultra-sensitive detection
    });

    let detection = null;
    try {
      detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();
    } catch (error) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (!detection) {
      updateStatus('noface');
      if (canvasRef.current) {
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      matchStreakRef.current = { userId: null, count: 0 };
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Draw green circle around detected face
    drawDetectionBox(detection);

    let bestMatch = null;
    let bestDistance = 1;

    usersRef.current.forEach((user) => {
      const descriptor = user.faceDescriptor;
      if (!descriptor) return;
      const { match, distance } = matchFace(detection.descriptor, descriptor, MATCH_THRESHOLD);
      if (match && distance < bestDistance) {
        bestMatch = user;
        bestDistance = distance;
      }
    });

    if (bestMatch) {
      // Instant match - auto check-in
      updateStatus('matched');
      cooldownRef.current = true;
      await markAttendance(bestMatch);
      matchStreakRef.current = { userId: null, count: 0 };
      setTimeout(() => {
        updateStatus('scanning');
        updateMessage('');
        setMatchedUser(null);
        cooldownRef.current = false;
      }, 1500); // Super-fast 1.5s reset
    } else {
      updateStatus('scanning');
      matchStreakRef.current = { userId: null, count: 0 };
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  };

  useEffect(() => {
    // Warm up and lock selected voice so voice doesn't switch between scans.
    if ('speechSynthesis' in window && !voiceListenerAttached) {
      const setVoice = () => {
        cachedKioskVoice = pickKioskVoice();
      };
      setVoice();
      window.speechSynthesis.addEventListener('voiceschanged', setVoice);
      voiceListenerAttached = true;
    }
  }, []);

  useEffect(() => {
    markedTodayRef.current = markedToday;
  }, [markedToday]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        updateStatus('loading');
        requestFullScreen();
        await ensureKioskAuth();
        await loadModels();
        await loadUsers();
        if (mounted) {
          await startCamera();
          rafRef.current = requestAnimationFrame(scanLoop);
        }
      } catch (error) {
        console.error('Kiosk init error:', error);
        updateStatus('error');
        updateMessage(error.message || 'Unable to start kiosk.');
      }
    };

    init();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopCamera();
    };
  }, []);

  // Voice assistant for attendance confirmation
  useEffect(() => {
    const onResize = () => setupCanvas();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Kiosk Mode</p>
            <h1 className="mt-2 text-3xl font-semibold">Zero-Touch Attendance</h1>
            <p className="mt-2 text-sm text-slate-300">
              Walk in front of the camera to record attendance automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={requestFullScreen}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/60"
          >
            Enter Full Screen
          </button>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_30px_60px_rgba(15,23,42,0.45)]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-130 w-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              style={{ pointerEvents: 'none' }}
            />
          </div>

          <div className="flex flex-col gap-6">
            {matchedUser && (status === 'success' || status === 'duplicate') && (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-6">
                <p className="text-sm font-semibold text-emerald-200">✓ Enrolled Face</p>
                <div className="mt-4 flex items-center justify-center">
                  {matchedUser.enrollmentPhoto ? (
                    <img
                      src={matchedUser.enrollmentPhoto}
                      alt="Enrolled face"
                      className="h-64 w-64 rounded-full border-2 border-emerald-400/60 object-cover shadow-[0_0_0_6px_rgba(16,185,129,0.15)]"
                    />
                  ) : (
                    <div className="h-64 w-64 rounded-full border-2 border-emerald-400/60 bg-slate-800 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">System Status</p>
              <p className="mt-3 text-lg text-indigo-200">
                {STATUS_COPY[status] || STATUS_COPY.scanning}
              </p>
              {cameraError && (
                <p className="mt-2 text-sm text-rose-200">{cameraError}</p>
              )}
              {message && (
                <div className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100">
                  {message}
                </div>
              )}
            </div>

            {false && matchedUser && (status === 'success' || status === 'duplicate') && (
              <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-6">
                <p className="text-sm font-semibold text-emerald-200">✓ Enrolled Face</p>
                <div className="mt-4 flex items-center gap-4">
                  {matchedUser.enrollmentPhoto ? (
                    <img 
                      src={matchedUser.enrollmentPhoto} 
                      alt="Enrolled face" 
                      className="h-56 w-56 rounded-full border-2 border-emerald-400/60 object-cover shadow-[0_0_0_6px_rgba(16,185,129,0.15)]"
                    />
                  ) : (
                    <div className="h-56 w-56 rounded-full border-2 border-emerald-400/60 bg-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{matchedUser.name}</p>
                        <p className="mt-2 text-xs text-slate-400">Face registered during enrollment</p>
                        <p className="mt-2 text-2xl">👤</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">Smart Auto-Detection</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>✨ Just stand in front of the camera</li>
                <li>🟢 Green circle shows face detected</li>
                <li>⚡ Automatic face detection (works from any angle)</li>
                <li>🎯 Instant check-in - no alignment needed</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-white">Next Person</p>
              <p className="mt-2 text-sm text-slate-300">
                Kiosk automatically resets in 1.5 seconds after each detection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kiosk;
