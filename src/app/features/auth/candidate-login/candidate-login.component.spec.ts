import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CandidateLoginComponent } from './candidate-login.component';
import { AuthService } from '../../../core/services/auth';

describe('CandidateLoginComponent', () => {
  let component: CandidateLoginComponent;
  let fixture: ComponentFixture<CandidateLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateLoginComponent],
      providers: [
        { provide: AuthService, useValue: { login: () => of({ token: 't', user: { role: 'Candidate' } }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
