import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export default function VisionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [serverIp, setServerIp] = useState('192.168.0.XX'); // IP of Mac Mini
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>카메라 권한이 필요합니다.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    addLog('스캔 시작 (5초 간격)');
    
    // Immediate first capture
    captureAndSend();

    // Loop
    intervalRef.current = setInterval(captureAndSend, 5000); // 5 seconds
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('스캔 중지');
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const captureAndSend = async () => {
    if (!cameraRef.current) return;

    try {
      addLog('촬영 중...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (photo?.uri) {
        // Resize to reduce upload size (optional but good for speed)
        const manipResult = await manipulateAsync(
            photo.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
        );
        uploadImage(manipResult.uri);
      }
    } catch (e) {
      addLog(`촬영 에러: ${e}`);
    }
  };

  const uploadImage = async (uri: string) => {
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
      } else {
        addLog(`❌ 서버 에러: ${json.error}`);
      }
    } catch (e) {
      addLog(`❌ 연결 실패 (IP 확인 필요)`);
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topBar}>
            <TextInput
              style={styles.input}
              value={serverIp}
              onChangeText={setServerIp}
              placeholder="Mac Mini IP (예: 192.168.0.5)"
              placeholderTextColor="#ccc"
            />
          </View>

          {/* Center Result Area */}
          <View style={styles.resultArea}>
            <Text style={styles.resultLabel}>인식 결과</Text>
            <Text style={styles.resultText}>{lastResult || "대기 중..."}</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
                style={[styles.scanButton, isScanning ? styles.stopBtn : styles.startBtn]} 
                onPress={toggleScanning}
            >
              <Text style={styles.scanBtnText}>
                {isScanning ? "스캔 중지 (STOP)" : "스캔 시작 (START)"}
              </Text>
            </TouchableOpacity>

            <ScrollView style={styles.logBox}>
              {logs.map((log, i) => (
                <Text key={i} style={styles.logText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  topBar: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 10,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    padding: 5,
  },
  resultArea: {
    alignItems: 'center',
  },
  resultLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  resultText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  bottomBar: {
    width: '100%',
  },
  scanButton: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: COLORS.primary, // Green
  },
  stopBtn: {
    backgroundColor: '#ff4444', // Red
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logBox: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 10,
  },
  logText: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 2,
  },
});
