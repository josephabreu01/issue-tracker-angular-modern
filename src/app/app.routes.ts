// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { IssueListComponent } from './components/issue-list/issue-list.component';
import { IssueDetailComponent } from './components/issue-detail/issue-detail.component';
import { IssueFormComponent } from './components/issue-form/issue-form.component';
import { LoginComponent } from './components/login/login.component';
import { PublicIssueFormComponent } from './components/public-issue-form/public-issue-form.component'; // Import the new component
import { authGuard } from './guards/auth.guard';
import {IssueChartComponent} from './components/issue-chart/issue-chart.component';

export const routes: Routes = [
  { path: '', redirectTo: '/issues', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'submit-issue', component: PublicIssueFormComponent }, // Public route for submitting issues
  {
    path: 'issues',
    component: IssueListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'issues/new',
    component: IssueFormComponent,
    canActivate: [authGuard] // This is the admin-only new issue form
  },
  {
    path: 'issues/edit/:id',
    component: IssueFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'issues/:id',
    component: IssueDetailComponent,
    canActivate: [authGuard]
  },
  {
    path :'charts',
    component:IssueChartComponent,
    canActivate: [authGuard]
  },
  {path:'',redirectTo:'/issues',pathMatch:'full'},
  { path: '**', redirectTo: '/issues' }
];
