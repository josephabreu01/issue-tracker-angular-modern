import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/Issue';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = 'https://json-server-q8vc.onrender.com/issues';

  constructor(private http: HttpClient) {}

  // --- MODIFIED: getIssues now accepts an optional status parameter ---
  getIssues(assignedToUsername?: string, status?: string): Observable<Issue[]> {
    let params = new HttpParams();

    if (assignedToUsername) {
      params = params.set('assignedToUsername', assignedToUsername);
    }
    if (status) { // Add status to params if provided
      params = params.set('status', status);
    }

    return this.http.get<Issue[]>(this.apiUrl, { params });
  }

  getIssueById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  createIssue(issue: Issue): Observable<Issue> {
    if (!issue.createdAt) {
      issue.createdAt = new Date();
    }
    issue.updatedAt = new Date();
    if (issue.assignedToUsername) { // Ensure assignedTo is set from assignedToUsername for JSON-server
      issue.assignedTo = issue.assignedToUsername;
    }
    return this.http.post<Issue>(this.apiUrl, issue);
  }

  updateIssue(id: string, issue: Partial<Issue>): Observable<Issue> {
    issue.updatedAt = new Date();
    // If assignedToUsername is part of the update (e.g., from admin), ensure assignedTo is consistent
    if (issue.assignedToUsername !== undefined) {
      issue.assignedTo = issue.assignedToUsername || '';
    }
    return this.http.put<Issue>(`${this.apiUrl}/${id}`, issue);
  }

  deleteIssue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
