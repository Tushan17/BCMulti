import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { NavBar } from './nav-bar';
import { routes } from '../../app.routes';

describe('NavBar', () => {
  let component: NavBar;
  let fixture: ComponentFixture<NavBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBar],
      providers: [
        provideRouter(routes),
        provideAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have two menu items', () => {
    expect(component.menuItems.length).toBe(2);
    expect(component.menuItems[0].label).toBe('Dashboard');
    expect(component.menuItems[1].label).toBe('Details');
  });
});
