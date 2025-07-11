// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (authService.isLoggedIn()) {
    // Check for specific roles if defined in route data (optional)
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = authService.currentUser()?.role;
      if (userRole && requiredRoles.includes(userRole)) {
        return true;
      } else {
        snackBar.open('Access Denied: You do not have the required role.', 'Close', { duration: 3000 });
        router.navigate(['/issues']); // Redirect to a safe page or issues list
        return false;
      }
    }
    return true; // User is logged in and no specific role required, or role matches
  } else {
    snackBar.open('Please log in to access this page.', 'Close', { duration: 3000 });
    router.navigate(['/login']); // Redirect to login page
    return false;
  }
};