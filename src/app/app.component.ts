import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router'; // Import RouterModule for routerLink

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // If you use buttons in toolbar
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // App component is standalone
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule, // Import RouterModule here
    MatToolbarModule,
    MatIconModule,
    MatButtonModule

  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'issue-tracker-angular-modern';

  constructor(public authService: AuthService){}
}