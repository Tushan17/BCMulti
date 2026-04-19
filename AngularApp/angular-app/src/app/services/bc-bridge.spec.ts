import { TestBed } from '@angular/core/testing';

import { BcBridgeService } from './bc-bridge';

describe('BcBridgeService', () => {
  let service: BcBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BcBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit default record', async () => {
    const rec = await new Promise<unknown>((resolve) => {
      service.record$.subscribe(resolve);
    });
    expect(rec).toBeDefined();
    expect(typeof (rec as { name: string }).name).toBe('string');
  });

  it('should update record when onBCLoadData event fires', async () => {
    const testData = { name: 'Test', description: 'Desc', amount: 42 };
    const p = new Promise<unknown>((resolve) => {
      service.record$.subscribe((r) => {
        if (r.name === 'Test') resolve(r);
      });
    });
    window.dispatchEvent(new CustomEvent('onBCLoadData', { detail: testData }));
    const rec = await p as { amount: number };
    expect(rec.amount).toBe(42);
  });

  it('should dispatch onDataChange event when sendDataToBC is called', async () => {
    const testData = { name: 'BC', description: '', amount: 10 };
    const p = new Promise<unknown>((resolve) => {
      window.addEventListener('onDataChange', (e: Event) => {
        resolve((e as CustomEvent).detail);
      }, { once: true });
    });
    service.sendDataToBC(testData);
    const detail = await p as { name: string };
    expect(detail.name).toBe('BC');
  });
});
