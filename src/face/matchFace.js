import * as faceapi from 'face-api.js';

export const matchFace = (descriptor, storedDescriptor, threshold = 0.5) => {
  const distance = faceapi.euclideanDistance(descriptor, storedDescriptor);
  return { match: distance < threshold, distance };
};
