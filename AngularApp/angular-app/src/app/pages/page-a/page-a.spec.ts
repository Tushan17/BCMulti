import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { PageA } from './page-a';
import { routes } from '../../app.routes';

describe('PageA', () => {
  let component: PageA;
  let fixture: ComponentFixture<PageA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageA],
      providers: [
        provideRouter(routes),
        provideAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageA);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty form', () => {
    expect(component.localRecord.name).toBe('');
    expect(component.localRecord.amount).toBe(0);
    expect(component.isDirty).toBeFalsy();
  });

  it('should mark dirty on field change', () => {
    component.onFieldChange();
    expect(component.isDirty).toBeTruthy();
  });

  it('should reset dirty on discardChanges', () => {
    component.isDirty = true;
    component.discardChanges();
    expect(component.isDirty).toBeFalsy();
  });
});
