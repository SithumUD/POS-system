import { Alert } from 'react-native';

export class PrinterService {
  /**
   * Mocks connecting to a Bluetooth printer.
   */
  static async connect(macAddress: string): Promise<boolean> {
    console.log(`[PrinterService] Mock connected to printer at ${macAddress}`);
    return true;
  }

  /**
   * Mocks printing a base64 ESC/POS string.
   */
  static async printBase64(base64Payload: string): Promise<void> {
    console.log('[PrinterService] Received receipt payload:');
    console.log(base64Payload);
    console.log('[PrinterService] Mock print complete.');
    
    // Show visual confirmation on the device
    Alert.alert(
      'Print Job Received',
      'The receipt payload was successfully received over WebSockets!\n\n(Bluetooth printing is mocked)',
      [{ text: 'OK' }]
    );
  }

  static async getPairedDevices(): Promise<{ name: string; address: string }[]> {
    return [
      { name: 'Mock Thermal Printer', address: '00:11:22:33:44:55' },
    ];
  }
}
