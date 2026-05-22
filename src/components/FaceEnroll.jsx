import { useEffect, useRef, useState } from 'react';
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { getFaceProfiles, saveFaceDescriptor } from '../services/userService';
import { loadModels } from '../face/loadModels';
import { captureDescriptor } from '../face/captureDescriptor';
import { matchFace } from '../face/matchFace';
import Layout from './Layout';

const FaceEnroll = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Initializing camera...');
  const [loading, setLoading] = useState(false);
  const [hasFace, setHasFace] = useState(false);
  const [hasModels, setHasModels] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  const DUPLICATE_THRESHOLD = 0.6;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera API not available in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      setCameraEnabled(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error('Play error:', err);
            setCameraError('Could not start video playback');
          });
        };
      }
      setStatus('Align your face within the guide.');
      console.log('Camera started successfully, stream:', stream);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Camera access blocked or unavailable.');
      setStatus('Camera access denied.');
    }
  };

  useEffect(() => {
    const setupModels = async () => {
      try {
        await loadModels();
        setHasModels(true);
        setStatus('Align your face within the guide.');
      } catch (error) {
        setStatus('Model loading failed.');
      }
    };

    setupModels();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let detectedCount = 0;
    let lastLogTime = Date.now();

    const detectFace = async () => {
      if (!videoRef.current || !hasModels || !cameraEnabled) {
        return;
      }

      frameCount++;

      // Log status every 2 seconds
      if (Date.now() - lastLogTime > 2000) {
        console.log(`Detection loop: ${frameCount} frames processed, ${detectedCount} faces detected`);
        lastLogTime = Date.now();
      }

      // Check video is really playing
      if (videoRef.current.srcObject === null || videoRef.current.readyState !== 4) {
        return;
      }

      try {
        const detection = await captureDescriptor(videoRef.current);
        if (detection) {
          detectedCount++;
          if (!hasFace) {
            console.log('Face detected for first time!');
            setHasFace(true);
          }
        } else {
          if (hasFace) {
            setHasFace(false);
          }
          if (duplicateDetected) {
            setDuplicateDetected(false);
            setDuplicateMessage('');
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    // Run detection loop if models loaded and camera enabled
    if (hasModels && cameraEnabled) {
      console.log('Starting detection loop');
      const interval = setInterval(detectFace, 100);
      return () => {
        clearInterval(interval);
      };
    }
  }, [hasModels, cameraEnabled, hasFace]);

  const handleEnroll = async () => {
    if (!user || !videoRef.current || !hasFace || duplicateDetected) return;
    setLoading(true);
    setStatus('Saving face profile...');

    try {
      const detection = await captureDescriptor(videoRef.current);
      if (!detection) {
        setStatus('No face detected. Try again.');
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const enrollmentPhoto = tempCanvas.toDataURL('image/jpeg', 0.8);

      const profilesResult = await getFaceProfiles();
      if (profilesResult.success) {
        const duplicate = profilesResult.data.find((candidate) => {
          if (candidate?._id === user.uid) return false;
          if (!Array.isArray(candidate.faceDescriptor)) return false;
          const { match } = matchFace(detection.descriptor, candidate.faceDescriptor, DUPLICATE_THRESHOLD);
          return match;
        });

        if (duplicate) {
          const message = 'Face already registered. Please use a different account.';
          setDuplicateDetected(true);
          setDuplicateMessage(message);
          setStatus(message);
          setLoading(false);
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        }
      }

      const result = await saveFaceDescriptor(user.uid, descriptor, enrollmentPhoto);

      if (result.success) {
        setStatus('Enrollment complete!');
        setEnrolled(true);
        setLoading(false);

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setStatus(result.error || 'Enrollment failed. Try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setStatus('Enrollment failed. Try again.');
      setLoading(false);
    }
  };

  // Auto-capture when face detected
  useEffect(() => {
    if (hasFace && !loading && hasModels && !enrolled && !duplicateDetected) {
      const timeout = setTimeout(() => {
        handleEnroll();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasFace, loading, hasModels, enrolled, duplicateDetected]);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-0">
        {/* Header */}
        <div className="rounded-t-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E5E7EB]">Face Enrollment</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-[#9CA3AF]">
                Position your face in the circle. Good lighting required.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-[#6366F1]">
              <CameraIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Large Video Area */}
        <div className="relative w-full overflow-hidden border-x border-slate-200 bg-black dark:border-[#1F2937]" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          
          {/* Face Detection Circle Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={`rounded-full border-4 transition-all ${
                duplicateDetected
                  ? 'border-red-500 shadow-2xl shadow-red-500/60 h-96 w-96'
                  : hasFace
                  ? 'border-green-400 shadow-2xl shadow-green-400/70 h-96 w-96'
                  : 'border-white/50 h-80 w-80'
              }`}
            />
          </div>

          {/* Detection Status */}
          {duplicateDetected ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">DUPLICATE FACE</div>
                <div className="text-sm text-red-300">{duplicateMessage || 'Already registered'}</div>
              </div>
            </div>
          ) : hasFace ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">FACE DETECTED</div>
                <div className="text-sm text-green-300">Saving...</div>
              </div>
            </div>
          ) : null}

          {/* Camera Not Ready */}
          {!cameraEnabled && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white">
                <div className="text-lg font-semibold">Click "Enable Camera" to start</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-4 rounded-b-2xl border border-x border-t-0 border-slate-200 bg-white p-6 shadow-sm dark:border-[#1F2937] dark:bg-[#111827]">
          {enrolled ? (
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Enrollment successful!</div>
                <div className="text-xs opacity-75">Redirecting to dashboard...</div>
              </div>
            </div>
          ) : duplicateDetected ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {duplicateMessage || 'Face already registered. Redirecting to login...'}
            </div>
          ) : hasFace ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              Face detected! Your profile is being saved automatically...
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {cameraError || 'Position your face in the circle. Make sure you are well-lit.'}
            </div>
          )}

          <button
            type="button"
            onClick={startCamera}
            disabled={enrolled}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#1F2937] dark:text-[#9CA3AF] dark:hover:bg-[#1F2937]"
          >
            {enrolled ? 'Enrollment Complete' : streamRef.current ? 'Camera Enabled' : 'Enable Camera'}
          </button>

          <div className="text-xs text-slate-500 dark:text-[#9CA3AF]">
            Your face is stored securely and used only for attendance verification.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FaceEnroll;
