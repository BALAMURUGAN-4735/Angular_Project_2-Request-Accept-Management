import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 🟢 FIXED: Imported your AuthService

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  showPassword = false;

  // 🟢 FIXED: Injected AuthService alongside Router inside the constructor
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Toggles password input visibility state
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Handles registration actions
  signup(): void {
    if (!this.name || !this.email || !this.password) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const userData = {
      name: this.name.toUpperCase().trim(),
      email: this.email.trim(),
      password: this.password.trim(),
      role: 'USER' // Default role for fresh registrations
    };

    console.log('Sending registration payload to backend:', userData);
    
    // 🟢 FIXED: Making a true backend request via the AuthService
    this.authService.signup(userData).subscribe({
      next: (response: any) => {
        // Triggers ONLY if the Spring Boot server saves the user successfully (HTTP 200 OK)
        alert('Account successfully registered!');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        // Triggers if email already exists or the backend server drops out
        console.error('Registration network error:', err);
        const errorMsg = err.error?.message || 'Registration failed. Please try again.';
        alert(errorMsg);
      }
    });
  }
}