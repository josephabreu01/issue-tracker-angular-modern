import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);

  // --- Mock Backend for Login and Users ---
  private mockUsers = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'generic1', password: 'genericpassword', role: 'generic' },
    { username: 'generic2', password: 'genericpassword', role: 'generic' },
    { username: 'testuser', password: 'password', role: 'generic' } // Another generic user for testing
  ];

  constructor(private router: Router, private snackBar: MatSnackBar) {
    this.loadCurrentUserFromLocalStorage();
  }

  login(username: string, password: string): Observable<User> {
    const foundUser = this.mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const token = btoa(JSON.stringify({ username: foundUser.username, role: foundUser.role, exp: Date.now() + 3600000 }));
      const user: User = { username: foundUser.username, role: foundUser.role as 'admin' | 'generic', token: token , password: foundUser.password};
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.snackBar.open(`Welcome, ${user.username}!`, 'Close', { duration: 2000 });
      return of(user);
    } else {
      this.snackBar.open('Invalid username or password', 'Close', { duration: 3000 });
      return throwError(() => new Error('Invalid credentials'));
    }
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.snackBar.open('You have been logged out.', 'Close', { duration: 2000 });
    this.router.navigate(['/login']);
  }

  private loadCurrentUserFromLocalStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.currentUser.set(user);
      } catch (e) {
        console.error('Error parsing user from local storage:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isGeneric(): boolean {
    return this.currentUser()?.role === 'generic';
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  /**
   * Returns a list of all generic user usernames.
   * In a real app, this would be an API call to fetch users with a 'generic' role.
   */
  getGenericUsernames(): Observable<string[]> {
    const genericUsernames = this.mockUsers
      .filter(user => user.role === 'generic')
      .map(user => user.username);
    return of(genericUsernames); // Return as Observable
  }

  private getNotificationKey(username: string): string {
    return `lastNotificationCheck_${username}`;
  }

  /**
   * Retrieves the timestamp (milliseconds) of the last time this user acknowledged notifications.
   * Defaults to 0 if never set.
   */
  getLastNotificationCheck(username: string): number {
    const timestampStr = localStorage.getItem(this.getNotificationKey(username));
    return timestampStr ? parseInt(timestampStr, 10) : 0;
  }

  /**
   * Updates the timestamp for when this user last checked/acknowledged notifications.
   * @param username The username of the user.
   * @param timestamp The timestamp (milliseconds) to set.
   */
  updateLastNotificationCheck(username: string, timestamp: number): void {
    localStorage.setItem(this.getNotificationKey(username), timestamp.toString());
  }
}