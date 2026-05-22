import { useEffect, useMemo, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { getUserById } from '../services/userService';
import { loadModels } from '../face/loadModels';
import { captureDescriptor } from '../face/captureDescriptor';
import { matchFace } from '../face/matchFace';

const statusMap = {
  idle: 'Detecting face...',
  noface: 'No face detected',
  multiple: 'Multiple faces detected',
  move: 'Please move slightly',
  ready: 'Face ready for verification',
  matched: 'Face matched',
  failed: 'Verification failed',
};

const FaceCheckInModal = ({ open, onClose, userId, onVerified }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [movementDetected, setMovementDetected] = useState(false);
  const [storedDescriptor, setStoredDescriptor] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const statusText = statusMap[status] || statusMap.idle;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      await loadModels();
      if (!open) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('idle');
    } catch (error) {
      setCameraError('Camera access blocked. Please allow camera permissions.');
      setStatus('failed');
    }
  };

  useEffect(() => {
    if (open) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  useEffect(() => {
    const fetchDescriptor = async () => {
      if (!userId) return;
      const result = await getUserById(userId);
      if (result.success && result.data.faceDescriptor) {
        setStoredDescriptor(result.data.faceDescriptor);
      }
    };

    if (open) {
      fetchDescriptor();
    }
  }, [open, userId]);

  useEffect(() => {
    let animationId;
    let lastLandmarks;

    const detect = async () => {
      if (!open || !videoRef.current) return;
      if (videoRef.current.readyState < 2) {
        animationId = requestAnimationFrame(detect);
        return;
      }
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
      const detections = await faceapi.detectAllFaces(videoRef.current, options).withFaceLandmarks();

      if (detections.length === 0) {
        setStatus('noface');
      } else if (detections.length > 1) {
        setStatus('multiple');
      } else {
        const current = detections[0].landmarks.positions;
        if (lastLandmarks) {
          const movement = current.reduce((sum, point, idx) => {
            const prev = lastLandmarks[idx];
            return sum + Math.hypot(point.x - prev.x, point.y - prev.y);
          }, 0) / current.length;
          if (movement > 1.5) {
            setMovementDetected(true);
          }
        }
        lastLandmarks = current;
        setStatus(movementDetected ? 'ready' : 'move');
      }

      animationId = requestAnimationFrame(detect);
    };

    if (open) {
      animationId = requestAnimationFrame(detect);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [open, movementDetected]);

  const canVerify = useMemo(() => {
    return status === 'ready' && movementDetected && storedDescriptor?.length;
  }, [status, movementDetected, storedDescriptor]);

  const handleVerify = async () => {
    if (!videoRef.current || !storedDescriptor) return;
    setLoading(true);
    const detection = await captureDescriptor(videoRef.current);
    if (!detection) {
      setStatus('noface');
      setLoading(false);
      return;
    }

    const { match, distance } = matchFace(detection.descriptor, storedDescriptor, 0.5);
    if (match) {
      setStatus('matched');
      onVerified({ matchScore: distance });
    } else {
      setStatus('failed');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#111827]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#1F2937]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-[#E5E7EB]">Face Verification</h2>
            <p className="text-sm text-slate-500 dark:text-[#9CA3AF]">Secure check-in with face recognition</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-[#1F2937]">
            <video ref={videoRef} autoPlay muted playsInline className="h-64 w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full border-2 border-white/70" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-[#1F2937] dark:bg-[#0B1220] dark:text-[#9CA3AF]">
              {cameraError
                ? cameraError
                : storedDescriptor
                ? statusText
                : 'No enrolled face profile found. Complete face enrollment first.'}
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={!canVerify || loading}
              className="w-full rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Check In'}
            </button>

            {!storedDescriptor ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/face-enroll');
                }}
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
              >
                Go to Face Enrollment
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setMovementDetected(false);
                  startCamera();
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
              >
                Retry
              </button>
            )}

            <p className="text-xs text-slate-500 dark:text-[#9CA3AF]">
              Keep your face centered and move slightly for liveness detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceCheckInModal;
