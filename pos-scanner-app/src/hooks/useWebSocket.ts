import { useEffect, useState, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PrinterService } from '../services/PrinterService';

// Required for stomjs in React Native
import 'text-encoding';

export function useWebSocket(terminalId: string, apiUrl: string) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!terminalId || !apiUrl) return;

    // Convert http://ip:port/api/v1 to http://ip:port/ws
    const brokerUrl = `${apiUrl.replace('/api/v1', '')}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(brokerUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Debug logging
      debug: (str) => {
        console.log('[STOMP]', str);
      },
    });

    client.onConnect = () => {
      setConnected(true);
      console.log('STOMP connected');
      
      client.subscribe(`/topic/terminal/${terminalId}/prints`, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          if (payload.base64Receipt) {
             PrinterService.printBase64(payload.base64Receipt);
          }
        } catch (e) {
          console.error("Failed to parse print payload", e);
        }
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
      console.log('STOMP disconnected');
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [terminalId, apiUrl]);

  const sendScan = useCallback((barcode: string) => {
    if (clientRef.current?.connected && terminalId) {
      clientRef.current.publish({
        destination: `/app/terminal/${terminalId}/scan`,
        body: JSON.stringify({ terminalId, barcode }),
      });
      return true;
    }
    return false;
  }, [terminalId]);

  return { connected, sendScan };
}
