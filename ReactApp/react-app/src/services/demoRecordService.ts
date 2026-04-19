/**
 * demoRecordService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Service that owns the "DemoRecord" domain and communicates with Business
 * Central through the generic bridge.
 *
 * This is the ONLY place in the React app that knows:
 *  • the shape of a DemoRecord
 *  • the message types used to transport it
 *
 * Components never call the bridge directly; they call this service instead.
 *
 * Message types
 * ─────────────
 *  React → BC
 *    'demo.record.query'  – ask BC for the current record (payload: null)
 *    'demo.record.save'   – save changes to BC (payload: DemoRecord)
 *    'demo.action'        – trigger a named action (payload: string)
 *
 *  BC → React
 *    'demo.record.load'   – BC pushes a record (payload: DemoRecord)
 *    'demo.readonly'      – BC sets read-only mode (payload: boolean)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { sendToBC, onFromBC, notifyReady } from '../bcGenericBridge';

// ── Domain types ─────────────────────────────────────────────────────────────

export interface DemoRecord {
  name: string;
  description: string;
  amount: number;
  readOnly?: boolean;
}

// ── Message-type constants ───────────────────────────────────────────────────

const MSG = {
  // React → BC
  QUERY: 'demo.record.query',
  SAVE: 'demo.record.save',
  ACTION: 'demo.action',
  // BC → React
  LOAD: 'demo.record.load',
  READONLY: 'demo.readonly',
} as const;

// ── Service methods ───────────────────────────────────────────────────────────

/**
 * Register a handler that is called whenever BC pushes a record to React.
 * Returns a cleanup function.
 */
export function onRecordLoaded(
  handler: (record: DemoRecord) => void
): () => void {
  return onFromBC<DemoRecord>(MSG.LOAD, handler);
}

/**
 * Register a handler for BC setting the read-only flag.
 * Returns a cleanup function.
 */
export function onReadOnlyChanged(
  handler: (readOnly: boolean) => void
): () => void {
  return onFromBC<boolean>(MSG.READONLY, handler);
}

/**
 * Ask BC to (re)send the current record.
 */
export function queryRecord(): void {
  sendToBC(MSG.QUERY, null);
}

/**
 * Persist a record update to BC.
 */
export function saveRecord(record: DemoRecord): void {
  sendToBC(MSG.SAVE, record);
}

/**
 * Trigger a named action on the BC side (e.g. 'refresh').
 */
export function triggerAction(actionName: string): void {
  sendToBC(MSG.ACTION, actionName);
}

/**
 * Signal to BC that React has mounted and is ready to receive data.
 * Call once in your root component's mount effect.
 */
export function notifyControlReady(): void {
  notifyReady();
}
