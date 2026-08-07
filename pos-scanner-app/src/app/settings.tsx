import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useStore } from '../contexts/StoreContext';
import { SaveIcon, SmartphoneIcon, WifiIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  const { terminalId, apiUrl, setTerminalId, setApiUrl, isReady } = useStore();
  const [draftId, setDraftId] = useState('');
  const [draftUrl, setDraftUrl] = useState('');

  useEffect(() => {
    if (isReady) {
      setDraftId(terminalId);
      setDraftUrl(apiUrl);
    }
  }, [isReady, terminalId, apiUrl]);

  const handleSave = async () => {
    if (!draftId.trim() || !draftUrl.trim()) {
      Alert.alert('Error', 'Please fill in both Terminal ID and API URL');
      return;
    }
    
    await setTerminalId(draftId.trim());
    await setApiUrl(draftUrl.trim());
    Alert.alert('Success', 'Settings saved successfully');
  };

  if (!isReady) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <SmartphoneIcon color="#0f172a" size={24} />
          <Text style={styles.title}>Connection Settings</Text>
        </View>
        <Text style={styles.description}>
          Configure how this device connects to your main Web POS terminal.
        </Text>

        <Text style={styles.label}>Web POS Terminal ID (Branch ID)</Text>
        <TextInput
          style={styles.input}
          value={draftId}
          onChangeText={setDraftId}
          placeholder="e.g. main-branch"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Backend API URL (Local IP)</Text>
        <TextInput
          style={styles.input}
          value={draftUrl}
          onChangeText={setDraftUrl}
          placeholder="e.g. http://192.168.1.100:8080/api/v1"
          keyboardType="url"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <SaveIcon color="#fff" size={20} />
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <WifiIcon color="#0f172a" size={24} />
          <Text style={styles.title}>Bluetooth Printer (Mocked)</Text>
        </View>
        <Text style={styles.description}>
          The Bluetooth ESC/POS printer implementation is currently mocked. 
          When a receipt is sent here, it will log the Base64 output instead of printing to a physical device.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
