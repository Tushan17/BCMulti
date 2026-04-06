import { useState, useEffect, useCallback } from 'react';
import type { BCRecord } from './bcBridge';
import { sendDataToBC, triggerBCAction, onBCLoadData, onBCSetReadOnly, notifyControlReady } from './bcBridge';
import DataForm from './components/DataForm';
import './App.css';

const DEFAULT_DATA: BCRecord = {
  name: '',
  description: '',
  amount: 0,
  readOnly: false,
};

export default function App() {
  const [record, setRecord] = useState<BCRecord>(DEFAULT_DATA);
  const [readOnly, setReadOnly] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Register listeners for data coming from BC
    const cleanupData = onBCLoadData((data) => {
      setRecord(data);
      setIsConnected(true);
      setLastSync(new Date());
    });

    const cleanupReadOnly = onBCSetReadOnly((ro) => {
      setReadOnly(ro);
    });

    // Tell BC we are ready — BC will respond by calling LoadData()
    notifyControlReady();

    return () => {
      cleanupData();
      cleanupReadOnly();
    };
  }, []);

  const handleChange = useCallback((updated: BCRecord) => {
    setRecord(updated);
    sendDataToBC(updated);
    setLastSync(new Date());
  }, []);

  const handleAction = useCallback((action: string) => {
    triggerBCAction(action);
  }, []);

  return (
    <div className="bc-addin-root">
      <div className="bc-addin-header">
        <span className={`bc-status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="bc-status-text">
          {isConnected ? 'Connected to Business Central' : 'Waiting for Business Central…'}
        </span>
        {lastSync && (
          <span className="bc-last-sync">
            Last sync: {lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>

      <DataForm
        record={record}
        readOnly={readOnly}
        onChange={handleChange}
        onAction={handleAction}
      />
    </div>
  );
}
