import { useState, useRef, useCallback } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface VisionResult {
  status: 'success' | 'error';
  result?: string; // e.g., "3.5"
  error?: string;
}

export const useVision = (serverIp: string) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  }, []);

  const uploadImage = useCallback(async (uri: string) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append('image', {
        uri: uri,
        name: 'capture.jpg',
        type: 'image/jpeg',
    });

    try {
        const url = `http://${serverIp}:5000/analyze`;
        addLog(`전송 중... ${url}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        const json = await response.json();
        if (json.status === 'success') {
            const result = json.result; // "3.5" or "0"
            setLastResult(result);
            addLog(`✅ 결과: ${result}m`);
            return result;
        } else {
            addLog(`❌ 서버 에러: ${json.error}`);
            return null;
        }
    } catch (e) {
        addLog(`❌ 연결 실패 (IP 확인 필요)`);
        console.log(e);
        return null;
    }
  }, [serverIp, addLog]);

  const captureAndSend = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      addLog('촬영 중...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (photo?.uri) {
        const manipResult = await manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );
        return await uploadImage(manipResult.uri);
      }
    } catch (e) {
      addLog(`촬영 에러: ${e}`);
    }
    return null;
  }, [uploadImage, addLog]);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    addLog('스캔 시작 (5초 간격)');
    
    // Immediate capture
    captureAndSend();

    // Loop
    intervalRef.current = setInterval(captureAndSend, 5000);
  }, [captureAndSend, addLog]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('스캔 중지');
  }, [addLog]);

  const toggleScanning = useCallback(() => {
    if (isScanning) {
        stopScanning();
    } else {
        startScanning();
    }
  }, [isScanning, startScanning, stopScanning]);

  return {
    permission,
    requestPermission,
    isScanning,
    toggleScanning,
    startScanning,
    stopScanning,
    lastResult,
    logs,
    cameraRef
  };
};
