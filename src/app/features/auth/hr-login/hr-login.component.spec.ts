import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HrLoginComponent } from './hr-login.component';
import { AuthService } from '../../../core/services/auth';

describe('HrLoginComponent', () => {
  let component: HrLoginComponent;
  let fixture: ComponentFixture<HrLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrLoginComponent],
      providers: [
        { provide: AuthService, useValue: { loginWithUsername: () => of({ token: 't', user: { role: 'HR' } }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
