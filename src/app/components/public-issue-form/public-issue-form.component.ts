import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { IssueService } from '../../services/issue.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  selector: 'app-public-issue-form',
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
  templateUrl: './public-issue-form.component.html',
  styleUrls: ['./public-issue-form.component.scss']
})
export class PublicIssueFormComponent implements OnInit {
  publicIssueForm: FormGroup;
  isLoading = false;

  // Public users can only submit 'Open' issues with 'Low' or 'Medium' priority
  statuses = ['Open']; // Only 'Open'
  priorities = ['Low', 'Medium']; // Restricted priorities

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.publicIssueForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Open', Validators.required], // Default to Open
      priority: ['Medium', Validators.required], // Default to Medium
      // Public users cannot assign issues
      assignedTo: [''], // Optional, can be left empty for public
      assignedToUsername: [''] // Optional, can be left empty for public
    });
  }

  ngOnInit(): void {
    // No specific logic needed on init for a public form,
    // other than ensuring default values are set.
  }

  onSubmit(): void {
    if (this.publicIssueForm.invalid) {
      this.publicIssueForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const issue: Issue = this.publicIssueForm.value;

    // Set createdAt/updatedAt for new issues
    issue.createdAt = new Date();
    issue.updatedAt = new Date();

    // Ensure status and priority are locked to public options if not already
    issue.status = 'Open';
    if (!['Low', 'Medium'].includes(issue.priority)) {
      issue.priority = 'Medium'; // Default to medium if somehow invalid
    }
    // Clear assignment fields, public users cannot assign
    issue.assignedTo = '';
    issue.assignedToUsername = '';

    this.issueService.createIssue(issue).subscribe({
      next: () => {
        this.snackBar.open('Issue submitted successfully! We will review it shortly.', 'Close', { duration: 4000 });
        this.router.navigate(['/issues']); // Redirect to the main issues list (which they won't see if not logged in)
      },
      error: (err) => {
        console.error('Error submitting issue:', err);
        this.snackBar.open('Failed to submit issue. Please try again.', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}