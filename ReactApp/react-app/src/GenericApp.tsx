/**
 * GenericApp.tsx
 * Root component for the generic-bridge variant of the React add-in.
 *
 * Instead of calling bcBridge directly, it delegates all BC communication
 * to demoRecordService. The bridge is completely transparent to this component.
 *
 * To use this as the entry point, update index.tsx to import and mount
 * GenericApp instead of App.
 */
import { useState, useEffect, useCallback } from 'react';
import type { DemoRecord } from './services/demoRecordService';
import {
  onRecordLoaded,
  onReadOnlyChanged,
  saveRecord,
  triggerAction,
  notifyControlReady,
} from './services/demoRecordService';
import GenericDataForm from './components/GenericDataForm';
import './App.css';

const DEFAULT_RECORD: DemoRecord = {
  name: '',
  description: '',
  amount: 0,
  readOnly: false,
};

export default function GenericApp() {
  const [record, setRecord] = useState<DemoRecord>(DEFAULT_RECORD);
  const [readOnly, setReadOnly] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Register service-level listeners (BC → React)
    const cleanupLoad = onRecordLoaded((data) => {
      setRecord(data);
      setIsConnected(true);
      setLastSync(new Date());
    });

    const cleanupReadOnly = onReadOnlyChanged((ro) => {
      setReadOnly(ro);
    });

    // Tell BC we are ready; BC will respond with a 'demo.record.load' message
    notifyControlReady();

    return () => {
      cleanupLoad();
      cleanupReadOnly();
    };
  }, []);

  const handleChange = useCallback((updated: DemoRecord) => {
    setRecord(updated);
    saveRecord(updated); // goes through service → generic bridge → BC
    setLastSync(new Date());
  }, []);

  const handleAction = useCallback((action: string) => {
    triggerAction(action); // goes through service → generic bridge → BC
  }, []);

  return (
    <div className="bc-addin-root">
      <div className="bc-addin-header">
        <span
          className={`bc-status-dot ${isConnected ? 'connected' : 'disconnected'}`}
        />
        <span className="bc-status-text">
          {isConnected
            ? 'Connected to Business Central'
            : 'Waiting for Business Central…'}
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
