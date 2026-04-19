import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavBar } from './components/nav-bar/nav-bar';
import { BcBridgeService } from './services/bc-bridge';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly bcBridge = inject(BcBridgeService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // When BC specifies a target page, navigate to it
    this.bcBridge.page$.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      if (page) {
        this.router.navigate(['/' + page]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
