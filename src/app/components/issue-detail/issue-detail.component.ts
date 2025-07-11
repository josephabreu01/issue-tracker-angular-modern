import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For Common directives, date pipe
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // For routing

import { IssueService } from '../../services/issue.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { Issue } from '../../models/Issue';


@Component({
  selector: 'app-issue-detail',
  standalone: true, // This component is standalone
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.scss']
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | undefined;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private snackBar: MatSnackBar,
    public authService: AuthService // Make authService public

  ) { }

  ngOnInit(): void {
    this.getIssue();
  }

  getIssue(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.issueService.getIssueById(id).subscribe({
        next: (data) => {
          this.issue = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching issue detail:', err);
          this.isLoading = false;
          this.snackBar.open('Failed to load issue details. It might not exist.', 'Close', { duration: 3000 });
          this.router.navigate(['/issues']); // Redirect if issue not found
        }
      });
    } else {
      this.snackBar.open('Issue ID not provided.', 'Close', { duration: 3000 });
      this.router.navigate(['/issues']);
    }
  }

  deleteIssue(): void {
    if (this.issue?.id) {
      if (confirm('Are you sure you want to delete this issue?')) {
        this.issueService.deleteIssue(this.issue.id).subscribe({
          next: () => {
            this.snackBar.open('Issue deleted successfully!', 'Close', { duration: 2000 });
            this.router.navigate(['/issues']); // Go back to the list
          },
          error: (err) => {
            console.error('Error deleting issue:', err);
            this.snackBar.open('Failed to delete issue. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }
}