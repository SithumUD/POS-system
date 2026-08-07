import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  terminalId: string;
  apiUrl: string;
  setTerminalId: (id: string) => Promise<void>;
  setApiUrl: (url: string) => Promise<void>;
  isReady: boolean;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [terminalId, setTerminalIdState] = useState('');
  const [apiUrl, setApiUrlState] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const tId = await AsyncStorage.getItem('terminalId');
        const url = await AsyncStorage.getItem('apiUrl');
        
        if (tId) setTerminalIdState(tId);
        if (url) setApiUrlState(url);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsReady(true);
      }
    }
    loadSettings();
  }, []);

  const setTerminalId = async (id: string) => {
    try {
      await AsyncStorage.setItem('terminalId', id);
      setTerminalIdState(id);
    } catch (e) {
      console.error('Failed to save terminalId', e);
    }
  };

  const setApiUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem('apiUrl', url);
      setApiUrlState(url);
    } catch (e) {
      console.error('Failed to save apiUrl', e);
    }
  };

  return (
    <StoreContext.Provider value={{ terminalId, apiUrl, setTerminalId, setApiUrl, isReady }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
