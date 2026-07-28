import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  // 🟢 Base URL path matches your updated RequestController mapping precisely
  private api = 'http://localhost:8080/request';

  constructor(private http: HttpClient) {}

  // 🟢 FIXED: Calls POST http://localhost:8080/request/add?username=...
  addRequest(userId: string, request: any): Observable<any> {
    return this.http.post(`${this.api}/add?username=${encodeURIComponent(userId.trim())}`, request);
  }

  // Admin Dashboard List -> calls GET http://localhost:8080/request/all
  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/all`);
  }

  // 🟢 FIXED: Calls GET http://localhost:8080/request/user/own?userId=...
  getUserRequests(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/user/own?userId=${encodeURIComponent(username.trim())}`);
  }

  // Admin Dropdown Update -> calls PUT http://localhost:8080/request/update/{id}
  updateStatus(id: number, status: string, reason: string): Observable<any> {
    const payload = {
      status: status,
      reason: reason || '-'
    };
    // Sends properties inside a clean JSON object body to match the backend `@RequestBody`
    return this.http.put(`${this.api}/update/${id}`, payload); 
  }

  // User Deletes an individual request entry row mapping
  deleteRequest(id: number): Observable<any> {
    // 🟢 FIXED: Uses the HTTP DELETE protocol targeting the unique row ID element path
    return this.http.delete(`http://localhost:8080/request/delete/${id}`);
  }

  // User Edits Request -> calls PUT http://localhost:8080/request/action/edit/${id}
  editRequest(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.api}/action/edit/${id}`, payload);
  }

  // Forgot Password -> calls POST http://localhost:8080/request/forgot-password
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.api}/forgot-password`, data);
  }
}