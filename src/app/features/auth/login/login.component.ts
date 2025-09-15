import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit(): void {
    this.loginError = null;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const user = this.authService.login(email, password);

      if (user) {
        console.log('Login successful for user:', user.email);
        this.loginForm.reset();
        this.router.navigate(['/home']);
      } else {
        this.loginError = 'Pogrešna email adresa ili lozinka.';
        console.error('Login failed: Invalid credentials.');
      }
    } else {
      this.loginError = 'Molimo unesite ispravne podatke za prijavu.';
      console.error('Login form is invalid. Please enter valid credentials.');
      this.loginForm.markAllAsTouched();
    }
  }
}
