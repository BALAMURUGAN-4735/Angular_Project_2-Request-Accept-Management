import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service'; // 👈 1. Import your AuthService file path

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // No need for HttpClientModule here anymore since AuthService handles it!
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  // 👈 2. Inject your AuthService alongside the Router
  constructor(private router: Router, private authService: AuthService) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (!this.email || !this.password) {
      alert('Please fill out all fields.');
      return;
    }

    const loginPayload = {
      email: this.email.trim(),
      password: this.password.trim()
    };

    console.log('Sending credentials to backend via AuthService:', { email: this.email });

    // 👈 3. Call your service login method directly
    this.authService.login(loginPayload).subscribe({
      next: (response: any) => {
        // 🟢 Success Path: Credentials match the MySQL records perfectly
        alert('Login Successful!');
        
        // Use your service methods to cache the user session data
        this.authService.saveUser(response);
        
        // Save these flag strings to direct dashboard routes
        localStorage.setItem('role', response.role);
        localStorage.setItem('username', response.name);

        // Dynamically route based on verified server role properties
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err: any) => {
        // 🔴 Failure Path: The Spring Boot server sent back a 401 Unauthorized or 500 error exception status code
        console.error('Authentication error:', err);
        
        // Catch the explicit error text thrown from your Java UserService logic
        const errorMsg = err.error?.message || 'Access Denied: Invalid email or password credentials.';
        alert(errorMsg);
      }
    });
  }
}