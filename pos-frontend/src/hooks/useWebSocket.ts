import { useEffect, useState, useCallback, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import { BASE_URL } from '../api/client';

export interface ScanPayload {
  terminalId: string;
  barcode: string;
}

export function useWebSocket(terminalId: string | null, onScan: (barcode: string) => void) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onScanRef = useRef(onScan);

  // Keep ref up to date
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!terminalId) return;

    // Use ws:// or wss:// if API_BASE_URL is http/https
    // Or we can just use SockJS with http URL
    const brokerUrl = `${BASE_URL.replace('/api/v1', '')}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(brokerUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      toast.success('Mobile App Connected', { description: 'Terminal is ready to receive barcode scans.' });

      client.subscribe(`/topic/terminal/${terminalId}/scans`, (message: IMessage) => {
        try {
          const payload: ScanPayload = JSON.parse(message.body);
          if (payload.barcode) {
            onScanRef.current(payload.barcode);
          }
        } catch (e) {
          console.error("Failed to parse scan payload", e);
        }
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
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
  }, [terminalId]);

  const simulateScan = useCallback((barcode: string) => {
    if (clientRef.current?.connected && terminalId) {
      const payload: ScanPayload = { terminalId, barcode };
      clientRef.current.publish({
        destination: `/app/terminal/${terminalId}/scan`,
        body: JSON.stringify(payload),
      });
    } else {
      toast.error('Cannot simulate scan', { description: 'Mobile app WebSocket is not connected.' });
    }
  }, [terminalId]);

  const sendPrint = useCallback((base64Receipt: string) => {
    if (clientRef.current?.connected && terminalId) {
      clientRef.current.publish({
        destination: `/app/terminal/${terminalId}/print`,
        body: JSON.stringify({ terminalId, base64Receipt }),
      });
      return true;
    }
    return false;
  }, [terminalId]);

  return { connected, simulateScan, sendPrint };
}
