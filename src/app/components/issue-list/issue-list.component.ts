import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IssueService } from '../../services/issue.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field'; // <--- NEW: for mat-form-field
import { MatSelectModule } from '@angular/material/select';       // <--- NEW: for mat-select
import { Issue } from '../../models/Issue';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule, // Make sure to add this to imports
    MatSelectModule     // Make sure to add this to imports
  ],
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {
  issues: Issue[] = [];
  isLoading = true;
  displayedColumns: string[] = ['title', 'status', 'priority', 'assignedToUsername', 'actions'];

  // --- NEW: Filter properties ---
  selectedStatusFilter: string = 'Todos'; // Default filter value
  statusFilterOptions: string[] = ['Todos', 'Open', 'In Progress', 'Resolved', 'Closed']; // Options for the dropdown

  constructor(
    private issueService: IssueService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getIssues();
  }

  getIssues(): void {
    this.isLoading = true;
    let filterUsername: string | undefined = undefined;
    let filterStatus: string | undefined = undefined; // Initialize filterStatus

    if (this.authService.isGeneric()) {
      filterUsername = this.authService.currentUser()?.username;
    }

    // --- NEW: Apply status filter if not 'Todos' ---
    if (this.selectedStatusFilter !== 'Todos') {
      filterStatus = this.selectedStatusFilter;
    }

    // Pass both filters to the service
    this.issueService.getIssues(filterUsername, filterStatus).subscribe({
      next: (data) => {
        this.issues = data;
        this.isLoading = false;
        // Check for new issues only if user is generic and has issues
        if (this.authService.isGeneric() && this.issues.length > 0) {
          this.checkForNewAssignedIssues();
        }
      },
      error: (err) => {
        console.error('Error fetching issues:', err);
        this.isLoading = false;
        this.snackBar.open('Failed to load issues. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  // --- NEW: Method to handle filter change ---
  onStatusFilterChange(event: any): void {
    this.selectedStatusFilter = event.value; // Update the selected filter
    this.getIssues(); // Re-fetch issues with the new filter applied
  }

  deleteIssue(id: string | undefined): void {
    if (!id) {
      console.warn('Cannot delete issue: ID is undefined.');
      return;
    }

    if (confirm('Seguro que desea borrar este elemento ?')) {
      this.issueService.deleteIssue(id).subscribe({
        next: () => {
          this.snackBar.open('Issue deleted successfully!', 'Close', { duration: 2000 });
          this.getIssues(); // Refresh the list with current filters
        },
        error: (err) => {
          console.error('Error deleting issue:', err);
          this.snackBar.open('Failed to delete issue. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private checkForNewAssignedIssues(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.authService.isGeneric()) {
      return;
    }

    const lastCheckTimestamp = this.authService.getLastNotificationCheck(currentUser.username);
    let newIssuesCount = 0;
    let latestIssueTimestamp = lastCheckTimestamp;

    this.issues.forEach(issue => {
      const issueUpdatedTime = issue.updatedAt ? new Date(issue.updatedAt).getTime() : 0;
      const issueCreatedTime = issue.createdAt ? new Date(issue.createdAt).getTime() : 0;

      if (issueUpdatedTime > lastCheckTimestamp || issueCreatedTime > lastCheckTimestamp) {
        if (issue.assignedToUsername === currentUser.username) {
          newIssuesCount++;
          if (issueUpdatedTime > latestIssueTimestamp) {
            latestIssueTimestamp = issueUpdatedTime;
          }
        }
      }
    });

    if (newIssuesCount > 0) {
      this.snackBar.open(
        `You have ${newIssuesCount} new assigned issue(s)!`,
        'View',
        {
          duration: 5000,
          panelClass: ['notification-snackbar']
        }
      );
      this.authService.updateLastNotificationCheck(currentUser.username, Date.now());
    }
  }
}