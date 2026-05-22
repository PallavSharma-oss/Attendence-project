import * as faceapi from 'face-api.js';

export const captureDescriptor = async (video) => {
  if (!video || !video.srcObject) {
    return null;
  }

  try {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.05  // Very low threshold for enrollment (easier detection)
    });

    const detection = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection || null;
  } catch (error) {
    console.error('captureDescriptor error:', error);
    return null;
  }
};
