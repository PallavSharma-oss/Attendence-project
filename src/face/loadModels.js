import * as faceapi from 'face-api.js';

let modelPromise;

export const loadModels = async () => {
  if (!modelPromise) {
    const cdnUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';
    
    console.log('Loading face detection models from CDN...');
    
    modelPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl).catch((err) => {
        console.error('TinyFaceDetector load error:', err);
        throw err;
      }),
      faceapi.nets.faceLandmark68Net.loadFromUri(cdnUrl).catch((err) => {
        console.error('FaceLandmark68Net load error:', err);
        throw err;
      }),
      faceapi.nets.faceRecognitionNet.loadFromUri(cdnUrl).catch((err) => {
        console.error('FaceRecognitionNet load error:', err);
        throw err;
      })
    ]).then(() => {
      console.log('All models loaded successfully');
    }).catch((error) => {
      console.error('Model loading failed:', error);
      throw new Error('Face detection models failed to load. Check your internet connection.');
    });
  }
  return modelPromise;
};
