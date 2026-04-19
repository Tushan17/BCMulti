import { Routes } from '@angular/router';
import { PageA } from './pages/page-a/page-a';
import { PageB } from './pages/page-b/page-b';

export const routes: Routes = [
  { path: '', redirectTo: 'page-a', pathMatch: 'full' },
  { path: 'page-a', component: PageA },
  { path: 'page-b', component: PageB },
  { path: '**', redirectTo: 'page-a' },
];
