import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../services/request.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  requests: any[] = [];
  filteredRequests: any[] = [];
  
  // 🟢 NEW: MULTI-FILTER CONTROL STATES
  searchId: number | null = null;
  search = '';
  searchStatus = 'ALL';

  constructor(
    private requestService: RequestService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadRequests();
    }, 100);
  }

  loadRequests() {
    this.requestService.getAllRequests().subscribe({
      next: (res: any[]) => {
        console.log("Admin received data:", res);
        this.requests = [...res];        
        this.filteredRequests = [...res];
        this.filterTable();
        this.cdr.detectChanges();        
      },
      error: (err: any) => {
        console.error('Failed to pull admin records:', err);
      }
    });
  }

  // 🟢 UPGRADED: ADVANCED MULTI-FILTER COMPILATION LOGIC
  filterTable() {
    const textTerm = this.search.trim().toLowerCase();
    const idTerm = this.searchId;
    const statusTerm = this.searchStatus.toUpperCase();
   
    this.filteredRequests = this.requests.filter((r: any) => {
      // 1. Evaluate Unique Row ID Match
      const matchesId = idTerm ? (r.id === idTerm) : true;

      // 2. Evaluate Status Selection Dropdown Match
      const requestStatus = r.status ? r.status.toUpperCase() : 'PENDING';
      const matchesStatus = (statusTerm === 'ALL') ? true : (requestStatus === statusTerm);

      // 3. Evaluate User Info Text Match
      const titleMatch = r.title ? r.title.toLowerCase().includes(textTerm) : false;
      const descriptionMatch = r.description ? r.description.toLowerCase().includes(textTerm) : false;
      const creatorName = r.user && r.user.name ? r.user.name.toLowerCase() : '';
      const fallbackUsername = r.username ? r.username.toLowerCase() : '';
      const emailColumn = r.email ? r.email.toLowerCase() : '';
     
      const textMatch = titleMatch || descriptionMatch ||
                        creatorName.includes(textTerm) ||
                        fallbackUsername.includes(textTerm) ||
                        emailColumn.includes(textTerm);

      const matchesText = textTerm ? textMatch : true;

      // Row record returns true only if it clears all conditions
      return matchesId && matchesStatus && matchesText;
    });
   
    this.cdr.detectChanges();
  }

  resetFilters() {
    this.searchId = null;
    this.search = '';
    this.searchStatus = 'ALL';
    this.filterTable();
  }

  changeStatus(request: any) {
    let reasonText = "";

    if (request.status === 'Declined') {
      const promptReason = prompt("Enter Decline Reason:");

      if (promptReason == null || promptReason.trim() === "") {
        alert("A decline reason is required!");
        request.status = "Pending";
        this.cdr.detectChanges();
        return;
      }
      reasonText = promptReason;
      request.reason = reasonText;
    } else if (request.status === 'Cancelled') {
      reasonText = request.reason;
    } else {
      request.reason = "";
    }

    this.requestService
      .updateStatus(request.id, request.status, reasonText)
      .subscribe({
        next: (updatedRecord) => {
          alert(`Request status updated to ${request.status} successfully!`);
          this.loadRequests();
        },
        error: (err) => {
          console.error('Failed to change workflow state in database:', err);
          alert("Failed to update status in database.");
        }
      });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}