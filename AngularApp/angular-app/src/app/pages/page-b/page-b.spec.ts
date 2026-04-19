import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { PageB } from './page-b';
import { routes } from '../../app.routes';

describe('PageB', () => {
  let component: PageB;
  let fixture: ComponentFixture<PageB>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageB],
      providers: [
        provideRouter(routes),
        provideAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageB);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 4 detail rows', () => {
    expect(component.details.length).toBe(4);
  });

  it('should update details when BC data arrives', async () => {
    const testData = { name: 'Widget', description: 'A widget', amount: 99.99 };
    window.dispatchEvent(new CustomEvent('onBCLoadData', { detail: testData }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(component.record.name).toBe('Widget');
    expect(component.details.find(d => d.label === 'Name')?.value).toBe('Widget');
  });
});
