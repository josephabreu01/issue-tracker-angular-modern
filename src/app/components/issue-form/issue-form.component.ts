import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IssueService } from '../../services/issue.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service'; // Import AuthService

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Issue } from '../../models/Issue';


@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.scss']
})
export class IssueFormComponent implements OnInit {
  issueForm: FormGroup;
  issueId: string | null = null;
  isEditMode = false;
  isLoading = false;

  statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  genericUsernames: string[] = []; // New property to hold generic usernames

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public authService: AuthService // Inject AuthService
  ) {
    this.issueForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Open', Validators.required],
      priority: ['Medium', Validators.required],
      assignedTo: [''], // Existing field
      assignedToUsername: [''] // New field for user assignment
    });
  }

  ngOnInit(): void {
    // Only load generic usernames if the current user is an admin
    if (this.authService.isAdmin()) {
      this.authService.getGenericUsernames().subscribe({
        next: (usernames) => {
          this.genericUsernames = usernames;
        },
        error: (err) => {
          console.error('Error fetching generic usernames:', err);
          this.snackBar.open('Failed to load generic users for assignment.', 'Close', { duration: 3000 });
        }
      });
    }

    this.issueId = this.route.snapshot.paramMap.get('id');
    if (this.issueId) {
      this.isEditMode = true;
      this.isLoading = true;
      this.issueService.getIssueById(this.issueId).subscribe({
        next: (issue) => {
          this.issueForm.patchValue(issue);
          this.isLoading = false;

          if (!this.authService.isAdmin()) {
            this.disableNonStatusFields(); // Generic users cannot edit
            this.snackBar.open('You do not have permission to edit this issue.', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Error fetching issue for edit:', err);
          this.isLoading = false;
          this.snackBar.open('Failed to load issue for editing.', 'Close', { duration: 3000 });
          this.router.navigate(['/issues']);
        }
      });
    } else {
      // If it's a new issue creation, and not admin, redirect
      if (!this.authService.isAdmin()) {
        this.snackBar.open('You do not have permission to create issues.', 'Close', { duration: 3000 });
        this.router.navigate(['/issues']);
      }
    }
  }

  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const issue: Issue = this.issueForm.value;

    // Set createdAt/updatedAt for new issues
    if (!this.isEditMode) {
      issue.createdAt = new Date();
    }
    issue.updatedAt = new Date();

    if (this.isEditMode && this.issueId) {
      this.issueService.updateIssue(this.issueId, issue).subscribe({
        next: () => {
          this.snackBar.open('Issue updated successfully!', 'Close', { duration: 2000 });
          this.router.navigate(['/issues', this.issueId]);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating issue:', err);
          this.snackBar.open('Failed to update issue. Please try again.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.issueService.createIssue(issue).subscribe({
        next: () => {
          this.snackBar.open('Issue created successfully!', 'Close', { duration: 2000 });
          this.router.navigate(['/issues']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating issue:', err);
          this.snackBar.open('Failed to create issue. Please try again.', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  private disableNonStatusFields(): void {
  // Loop through all controls in the issueForm FormGroup
  Object.keys(this.issueForm.controls).forEach(key => {
    const control = this.issueForm.get(key); // Get the form control by its name (e.g., 'title', 'description')

    // If the control exists AND its name is NOT 'status'
    if (control && key !== 'status') {
      control.disable(); // Disable this form control
    }
  });
}
}