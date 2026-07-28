import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../services/request.service'; // Adjust path based on your folders

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotPasswordComponent {
  // Bindings matching your HTML [(ngModel)] targets
  email: string = '';
  newPassword: string = '';
  showPassword: boolean = false;

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  // Toggles password visibility input mode from 'password' to 'text'
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Sends the new password along with the account email identification parameter
  resetPassword(): void {
    if (!this.email.trim() || !this.newPassword.trim()) {
      alert("Please fill in both email and new password fields.");
      return;
    }

    const payload = {
      email: this.email.trim(),
      password: this.newPassword.trim()
    };

    console.log("Submitting password change payload:", payload);

    this.requestService.resetPassword(payload).subscribe({
      next: (res) => {
        // 1. Show the user that the database update was successful
        alert("Password updated successfully inside database record!");
        
        // 2. Clear out the input form fields automatically
        this.email = '';
        this.newPassword = '';

        // 3. 👈 IMMEDIATELY REDIRECT BACK TO THE LOGIN PAGE
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error('Password reset transaction failed:', err);
        alert(err.error?.message || "Failed to update password. Please check your network connection.");
      }
    });
  }

  // Back button event handler redirection navigation route link
  back(): void {
    this.router.navigate(['/login']);
  }
}