import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  signup(user: any): Observable<any> {
    return this.http.post(`${this.api}/signup`, user);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.api}/login`, data);
  }

  // 🟢 FIXED: Clears data for the current active tab only
  logout() {
    sessionStorage.clear();
  }

  // 🟢 FIXED: Saves user details into the tab's isolated session instance
  saveUser(user: any) {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('username', user.name || '');
    sessionStorage.setItem('role', user.role || '');
  }

  // 🟢 FIXED: Reads data exclusively from current tab's sessionStorage
  getUser() {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('user') != null;
  }
}