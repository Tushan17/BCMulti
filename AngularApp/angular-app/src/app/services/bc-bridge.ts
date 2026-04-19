/**
 * BcBridgeService
 * ─────────────────────────────────────────────────────────────────────────────
 * Angular service that bridges Business Central AL code and the Angular app.
 *
 * BC  →  Angular:
 *   BC calls AL procedure CurrPage.<ControlAddin>.LoadData(json)
 *   → controlAddin-events.js dispatches 'onBCLoadData' CustomEvent
 *   → this service pushes new data into the record$ Subject
 *
 * Angular  →  BC:
 *   Components call sendDataToBC() / triggerBCAction()
 *   → this service dispatches 'onDataChange' / 'onAction' CustomEvents
 *   → controlAddin-events.js forwards them to BC via InvokeExtensibilityMethod
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Shape of a record exchanged with Business Central. */
export interface BCRecord {
  name: string;
  description: string;
  amount: number;
  readOnly?: boolean;
  /** Optional: the default page BC wants the addin to show ('page-a' | 'page-b'). */
  page?: string;
}

const DEFAULT_RECORD: BCRecord = {
  name: '',
  description: '',
  amount: 0,
  readOnly: false,
};

@Injectable({
  providedIn: 'root',
})
export class BcBridgeService implements OnDestroy {
  // ── Subjects exposed as Observables ────────────────────────────────────────
  private readonly _record$ = new BehaviorSubject<BCRecord>(DEFAULT_RECORD);
  private readonly _readOnly$ = new BehaviorSubject<boolean>(false);
  private readonly _page$ = new BehaviorSubject<string>('page-a');
  private readonly _connected$ = new BehaviorSubject<boolean>(false);

  /** Emits the latest data record received from BC. */
  readonly record$: Observable<BCRecord> = this._record$.asObservable();

  /** Emits the current read-only state set by BC. */
  readonly readOnly$: Observable<boolean> = this._readOnly$.asObservable();

  /** Emits the page name that BC wants to display ('page-a' | 'page-b'). */
  readonly page$: Observable<string> = this._page$.asObservable();

  /** Emits true once BC has sent the first LoadData call. */
  readonly connected$: Observable<boolean> = this._connected$.asObservable();

  // ── DOM event handlers (kept for removeEventListener) ─────────────────────
  private readonly _onLoadData = (e: Event) => {
    const data = (e as CustomEvent<BCRecord>).detail ?? {};
    this._record$.next(data);
    this._connected$.next(true);
    if (data.readOnly !== undefined) {
      this._readOnly$.next(!!data.readOnly);
    }
    // If BC specifies a page, navigate there
    if (data.page) {
      this._page$.next(data.page);
    }
  };

  private readonly _onSetReadOnly = (e: Event) => {
    this._readOnly$.next(!!(e as CustomEvent<boolean>).detail);
  };

  private readonly _onSetPage = (e: Event) => {
    const page = (e as CustomEvent<string>).detail;
    if (page) {
      this._page$.next(page);
    }
  };

  constructor() {
    window.addEventListener('onBCLoadData', this._onLoadData);
    window.addEventListener('onBCSetReadOnly', this._onSetReadOnly);
    window.addEventListener('onBCSetPage', this._onSetPage);
    // Signal BC that Angular has mounted and is ready
    this.notifyControlReady();
  }

  ngOnDestroy(): void {
    window.removeEventListener('onBCLoadData', this._onLoadData);
    window.removeEventListener('onBCSetReadOnly', this._onSetReadOnly);
    window.removeEventListener('onBCSetPage', this._onSetPage);
  }

  // ── Methods to send data TO Business Central ───────────────────────────────

  /**
   * Send an updated record to BC.
   * controlAddin-events.js forwards this to InvokeExtensibilityMethod('OnDataChange', [json]).
   */
  sendDataToBC(data: BCRecord): void {
    window.dispatchEvent(new CustomEvent('onDataChange', { detail: data }));
  }

  /**
   * Trigger a named action in BC (e.g. 'refresh').
   * controlAddin-events.js forwards this to InvokeExtensibilityMethod('OnAction', [action]).
   */
  triggerBCAction(action: string): void {
    window.dispatchEvent(new CustomEvent('onAction', { detail: action }));
  }

  /**
   * Signal to BC that Angular has mounted and is ready to receive data.
   * controlAddin-events.js calls InvokeExtensibilityMethod('ControlReady', []).
   */
  private notifyControlReady(): void {
    window.dispatchEvent(new CustomEvent('onControlReady'));
  }

  // ── Snapshot getters (for components that need current value) ──────────────

  get currentRecord(): BCRecord {
    return this._record$.getValue();
  }

  get isReadOnly(): boolean {
    return this._readOnly$.getValue();
  }
}
