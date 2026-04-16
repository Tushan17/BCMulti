import { useState, useEffect, useCallback } from 'react';
import type { DemoRecord } from './services/demoRecordService';
import { onRecordLoaded, onReadOnlyChanged, saveRecord, triggerAction, notifyControlReady } from './services/demoRecordService';
import GenericDataForm from './components/GenericDataForm';
import './App.css';


const DEFAULT_DATA: DemoRecord = {
  name: '',
  description: '',
  amount: 0,
};

export default function App() {
  const [record, setRecord] = useState<DemoRecord>(DEFAULT_DATA);
  const [readOnly, setReadOnly] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Register listeners for data coming from BC
    const cleanupData = onRecordLoaded((data) => {
      setRecord(data);
      setIsConnected(true);
      setLastSync(new Date());
    });

    const cleanupReadOnly = onReadOnlyChanged((ro) => {
      setReadOnly(ro);
    });

    // Tell BC we are ready — BC will respond by sending the record
    notifyControlReady();

    return () => {
      cleanupData();
      cleanupReadOnly();
    };
  }, []);

  const handleChange = useCallback((updated: DemoRecord) => {
    setRecord(updated);
    saveRecord(updated);
    setLastSync(new Date());
  }, []);

  const handleAction = useCallback((action: string) => {
    triggerAction(action);
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

      <GenericDataForm
        record={record}
        readOnly={readOnly}
        onChange={handleChange}
        onAction={handleAction}
      />
    </div>
  );
}
