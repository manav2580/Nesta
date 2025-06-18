
  // lib/permissions.ts
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

export async function requestCameraAndMic() {
  const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
  const { status: micStatus } = await Audio.requestPermissionsAsync();

  if (cameraStatus !== 'granted') {
    alert('Camera permission is required for live tours.');
  }

  if (micStatus !== 'granted') {
    alert('Microphone permission is required for live tours.');
  }
}

