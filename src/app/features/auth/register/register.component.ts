import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { IUser } from '../../../models/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  registrationForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.fb.group(
      {
        fullName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', Validators.required),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', Validators.required),
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (
      confirmPassword.hasError('passwordMismatch') &&
      password.value === confirmPassword.value
    ) {
      confirmPassword.setErrors(null);
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.registrationForm.valid) {
      const { fullName, email, phone, password } = this.registrationForm.value;
      const userToRegister: Omit<IUser, 'id'> = {
        fullName,
        email,
        phone,
        password,
      };

      const success = this.authService.register(userToRegister);

      if (success) {
        console.log('Registration successful!');
        window.alert('Uspesno ste registrovani!');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 100);
      } else {
        console.error('Registration failed: User might already exist.');
        this.errorMessage =
          'Registracija neuspešna: Korisnik sa ovim email-om možda već postoji.';
      }
    } else {
      console.error(
        'Forma je nevalidna. Molimo popunite sva obavezna polja ispravno.'
      );
      this.registrationForm.markAllAsTouched();
      this.errorMessage = null;
    }
  }
}
