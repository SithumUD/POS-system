import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useStore } from '../contexts/StoreContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useRouter } from 'expo-router';
import { SettingsIcon, WifiIcon, WifiOffIcon, ScanLineIcon } from 'lucide-react-native';

export default function ScannerScreen() {
  const router = useRouter();
  const { terminalId, apiUrl, isReady } = useStore();
  const { connected, sendScan } = useWebSocket(terminalId, apiUrl);
  
  const [permission, requestPermission] = useCameraPermissions();
  
  // Rate limiting to prevent scanning the same barcode 50 times a second
  const [lastScanned, setLastScanned] = useState('');
  const [scanCooldown, setScanCooldown] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanCooldown || !connected) return;
    
    if (data && data !== lastScanned) {
      setLastScanned(data);
      setScanCooldown(true);
      
      const success = sendScan(data);
      if (success) {
        console.log('Scanned and sent:', data);
      }

      // Reset cooldown after 1.5s
      setTimeout(() => {
        setLastScanned('');
        setScanCooldown(false);
      }, 1500);
    }
  };

  if (!isReady || !permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!apiUrl || !terminalId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Please configure Terminal ID and API URL first.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
          <SettingsIcon color="#fff" size={20} />
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission is required to scan barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar overlay */}
      <View style={styles.topBar}>
        <View style={styles.statusPill}>
          {connected ? (
            <>
              <WifiIcon color="#10b981" size={16} />
              <Text style={[styles.statusText, { color: '#10b981' }]}>Connected to POS</Text>
            </>
          ) : (
            <>
              <WifiOffIcon color="#ef4444" size={16} />
              <Text style={[styles.statusText, { color: '#ef4444' }]}>Disconnected</Text>
            </>
          )}
        </View>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
          <SettingsIcon color="#0f172a" size={24} />
        </TouchableOpacity>
      </View>

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Target overlay */}
      <View style={styles.overlay}>
        <ScanLineIcon color="#fff" size={200} strokeWidth={1} style={{ opacity: 0.5 }} />
        {scanCooldown && (
          <View style={styles.successPill}>
            <Text style={styles.successText}>Scanned: {lastScanned}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    pointerEvents: 'none',
  },
  errorText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successPill: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  successText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
