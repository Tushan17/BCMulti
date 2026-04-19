import { useState, useEffect } from 'react';
import type { DemoRecord } from '../services/demoRecordService';

interface Props {
  record: DemoRecord;
  readOnly: boolean;
  onChange: (updated: DemoRecord) => void;
  onAction: (action: string) => void;
}

export default function GenericDataForm({
  record,
  readOnly,
  onChange,
  onAction,
}: Props) {
  const [local, setLocal] = useState<DemoRecord>(record);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when BC pushes a fresh record
  useEffect(() => {
    setLocal(record);
    setIsDirty(false);
  }, [record]);

  const handleField = (field: keyof DemoRecord, value: string | number) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onChange(local);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setLocal(record);
    setIsDirty(false);
  };

  return (
    <div className="bc-form">
      <div className="bc-form-row">
        <label htmlFor="gc-name" className="bc-label">
          Name
        </label>
        <input
          id="gc-name"
          className="bc-input"
          type="text"
          value={local.name}
          disabled={readOnly}
          onChange={(e) => handleField('name', e.target.value)}
          placeholder="Enter name…"
        />
      </div>

      <div className="bc-form-row">
        <label htmlFor="gc-description" className="bc-label">
          Description
        </label>
        <textarea
          id="gc-description"
          className="bc-input bc-textarea"
          value={local.description}
          disabled={readOnly}
          onChange={(e) => handleField('description', e.target.value)}
          placeholder="Enter description…"
          rows={3}
        />
      </div>

      <div className="bc-form-row">
        <label htmlFor="gc-amount" className="bc-label">
          Amount
        </label>
        <input
          id="gc-amount"
          className="bc-input bc-input-number"
          type="number"
          value={local.amount}
          disabled={readOnly}
          onChange={(e) =>
            handleField('amount', parseFloat(e.target.value) || 0)
          }
          step="0.01"
        />
      </div>

      {!readOnly && (
        <div className="bc-form-actions">
          <button
            className={`bc-btn bc-btn-primary ${!isDirty ? 'bc-btn-disabled' : ''}`}
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save to BC
          </button>
          <button
            className="bc-btn bc-btn-secondary"
            onClick={handleDiscard}
            disabled={!isDirty}
          >
            Discard
          </button>
          <button
            className="bc-btn bc-btn-outline"
            onClick={() => onAction('refresh')}
          >
            Refresh from BC
          </button>
        </div>
      )}
    </div>
  );
}
