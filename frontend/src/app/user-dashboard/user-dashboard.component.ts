import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../services/request.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  user: any;
  requests: any[] = [];          // Master original source data array
  filteredRequests: any[] = [];  // Holds the clean filtered rows visible to user
  showPopup = false;
  requestForm: FormGroup;
 
  // FILTER MODELLING FIELDS
  filterId: number | null = null;
  filterText: string = '';
  selectedStatusTab: string = 'ALL';

  isEditing = false;
  isResubmitting = false; // 🟢 Track if this is a resubmission text state
  currentEditingRequestId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      createdDate: ['']
    });
  }

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      createdDate: [new Date().toISOString().substring(0, 10)]
    });

    const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const targetUser = sessionStorage.getItem('username') || sessionUser.name || 'User';

    this.user = {
      name: targetUser,
      username: targetUser
    };

    this.loadRequests();
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  loadRequests() {
    if (this.user.username) {
      this.requestService.getUserRequests(this.user.username).subscribe({
        next: (data: any[]) => {
          console.log("Data successfully loaded:", data);
          this.requests = [...data];
          this.filterTable(); // Run filters to map structural changes to UI grid
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error fetching dashboard records:', err);
        }
      });
    }
  }

  // COMPLEX MULTI-FILTER COMPILATION ENGINE
  filterTable() {
    const textTerm = this.filterText.trim().toLowerCase();
    const idTerm = this.filterId;
    const tabTerm = this.selectedStatusTab.toUpperCase();

    this.filteredRequests = this.requests.filter((r: any) => {
      // 1. Evaluate ID Match
      const matchesId = idTerm ? (r.id === idTerm) : true;

      // 2. Evaluate Text Match (Title or Description)
      const titleString = r.title ? r.title.toLowerCase() : '';
      const descString = r.description ? r.description.toLowerCase() : '';
      const matchesText = textTerm ? (titleString.includes(textTerm) || descString.includes(textTerm)) : true;

      // 3. Evaluate Status Tab Match
      const requestStatus = r.status ? r.status.toUpperCase() : 'PENDING';
      const matchesTab = (tabTerm === 'ALL') ? true : (requestStatus === tabTerm);

      return matchesId && matchesText && matchesTab;
    });

    this.cdr.detectChanges();
  }

  setStatusTab(tabName: string) {
    this.selectedStatusTab = tabName;
    this.filterTable();
  }

  resetFilters() {
    this.filterId = null;
    this.filterText = '';
    this.selectedStatusTab = 'ALL';
    this.filterTable();
  }

  openPopup() {
    this.isEditing = false;
    this.isResubmitting = false;
    this.currentEditingRequestId = null;
    this.requestForm.reset({
      title: '',
      description: '',
      createdDate: new Date().toISOString().substring(0, 10)
    });
    this.showPopup = true;
  }

  openEditModal(request: any) {
    this.isEditing = true;
    // 🟢 Set resubmitting flag true if the clicked request status is 'Declined'
    this.isResubmitting = request.status?.toUpperCase() === 'DECLINED';
    this.currentEditingRequestId = request.id;
    this.showPopup = true;

    this.requestForm.patchValue({
      title: request.title,
      description: request.description,
      createdDate: request.createdDate
    });
    this.cdr.detectChanges();
  }

  closePopup() {
    this.showPopup = false;
    this.isEditing = false;
    this.isResubmitting = false;
    this.currentEditingRequestId = null;
    this.requestForm.reset();
  }

  submitRequest() {
    if (this.requestForm.invalid) {
      alert("Please fill out all mandatory fields.");
      return;
    }

    const activeUsername = this.user.username || 'User';
    
    // When editing/resubmitting, reset the status back to Pending on update payload
    const requestPayload = {
      title: this.requestForm.value.title.toUpperCase().trim(),
      description: this.requestForm.value.description,
      createdDate: this.requestForm.value.createdDate,
      status: 'Pending',
      reason: ''
    };

    if (this.isEditing && this.currentEditingRequestId) {
      this.requestService.editRequest(this.currentEditingRequestId, requestPayload).subscribe({
        next: () => {
          alert(this.isResubmitting ? "Request resubmitted successfully!" : "Request updated successfully!");
          this.closePopup();
          this.loadRequests();
        },
        error: (err: any) => console.error(err)
      });
    } else {
      this.requestService.addRequest(activeUsername, requestPayload).subscribe({
        next: () => {
          alert("Request Sent Successfully!");
          this.closePopup();
          this.loadRequests();
        },
        error: (err: any) => console.error('Error adding request:', err)
      });
    }
  }

  deleteRequest(id: number) {
    if (!id) {
      alert("Invalid request ID.");
      return;
    }

    if (confirm("Are you sure you want to delete this request permanently?")) {
      this.requestService.deleteRequest(id).subscribe({
        next: () => {
          alert("Request deleted successfully!");
          this.loadRequests();
        },
        error: (err: any) => {
          console.error("Failed to delete the request record:", err);
          alert("Error executing delete action inside database.");
        }
      });
    }
  }
}