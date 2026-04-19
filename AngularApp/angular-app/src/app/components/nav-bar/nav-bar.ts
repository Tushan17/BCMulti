import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { BcBridgeService } from '../../services/bc-bridge';

@Component({
  selector: 'app-nav-bar',
  imports: [Menubar, Tag, AsyncPipe],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar implements OnInit {
  private readonly bcBridge = inject(BcBridgeService);

  /** Emits true once BC has sent data (shows connection indicator). */
  readonly connected$ = this.bcBridge.connected$;

  /** PrimeNG Menubar items */
  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/page-a'],
      },
      {
        label: 'Details',
        icon: 'pi pi-list',
        routerLink: ['/page-b'],
      },
    ];
  }
}
