import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { BcBridgeService, BCRecord } from '../../services/bc-bridge';

@Component({
  selector: 'app-page-a',
  imports: [
    FormsModule,
    DatePipe,
    Card,
    InputText,
    Textarea,
    InputNumber,
    Button,
    Message,
  ],
  templateUrl: './page-a.html',
  styleUrl: './page-a.scss',
})
export class PageA implements OnInit, OnDestroy {
  private readonly bcBridge = inject(BcBridgeService);
  private readonly destroy$ = new Subject<void>();

  /** Local copy of the record for two-way binding. */
  localRecord: BCRecord = { name: '', description: '', amount: 0 };
  readOnly = false;
  isDirty = false;
  lastSync: Date | null = null;

  ngOnInit(): void {
    // Sync local state when BC sends updated data
    this.bcBridge.record$.pipe(takeUntil(this.destroy$)).subscribe((rec) => {
      this.localRecord = { ...rec };
      this.isDirty = false;
      this.lastSync = new Date();
    });

    this.bcBridge.readOnly$.pipe(takeUntil(this.destroy$)).subscribe((ro) => {
      this.readOnly = ro;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFieldChange(): void {
    this.isDirty = true;
  }

  saveToBC(): void {
    this.bcBridge.sendDataToBC(this.localRecord);
    this.isDirty = false;
    this.lastSync = new Date();
  }

  discardChanges(): void {
    this.localRecord = { ...this.bcBridge.currentRecord };
    this.isDirty = false;
  }

  refreshFromBC(): void {
    this.bcBridge.triggerBCAction('refresh');
  }
}
