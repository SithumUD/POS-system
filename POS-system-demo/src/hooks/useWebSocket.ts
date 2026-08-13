/**
 * DEMO MODE — useWebSocket stub
 * Real WebSocket connection removed. Returns no-op functions.
 * In demo mode, barcode scanning works via keyboard input only.
 */
import { useCallback } from 'react';

export interface ScanPayload {
  terminalId: string;
  barcode: string;
}

export function useWebSocket(_terminalId: string | null, _onScan: (barcode: string) => void) {
  const simulateScan = useCallback((_barcode: string) => {
    // No-op in demo mode
  }, []);

  const sendPrint = useCallback((_base64Receipt: string) => {
    return false;
  }, []);

  return { connected: false, simulateScan, sendPrint };
}
