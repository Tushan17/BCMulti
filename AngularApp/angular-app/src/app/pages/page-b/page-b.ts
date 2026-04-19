import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { DataView } from 'primeng/dataview';
import { BcBridgeService, BCRecord } from '../../services/bc-bridge';

/** A single detail row displayed in the dataview */
interface DetailRow {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-page-b',
  imports: [DatePipe, Card, Button, Tag, Divider, DataView],
  templateUrl: './page-b.html',
  styleUrl: './page-b.scss',
})
export class PageB implements OnInit, OnDestroy {
  private readonly bcBridge = inject(BcBridgeService);
  private readonly destroy$ = new Subject<void>();

  record: BCRecord = { name: '', description: '', amount: 0 };
  readOnly = false;
  lastSync: Date | null = null;
  details: DetailRow[] = [];

  ngOnInit(): void {
    this.bcBridge.record$.pipe(takeUntil(this.destroy$)).subscribe((rec) => {
      this.record = rec;
      this.lastSync = new Date();
      this.buildDetails(rec);
    });

    this.bcBridge.readOnly$.pipe(takeUntil(this.destroy$)).subscribe((ro) => {
      this.readOnly = ro;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildDetails(rec: BCRecord): void {
    this.details = [
      { label: 'Name', value: rec.name || '—', icon: 'pi pi-user' },
      {
        label: 'Description',
        value: rec.description || '—',
        icon: 'pi pi-align-left',
      },
      {
        label: 'Amount',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(rec.amount ?? 0),
        icon: 'pi pi-dollar',
      },
      {
        label: 'Mode',
        value: rec.readOnly ? 'Read-Only' : 'Editable',
        icon: rec.readOnly ? 'pi pi-lock' : 'pi pi-lock-open',
      },
    ];
  }

  refreshFromBC(): void {
    this.bcBridge.triggerBCAction('refresh');
  }
}
