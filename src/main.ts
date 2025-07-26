// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Import withInterceptors
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';


bootstrapApplication(AppComponent, {
  providers: [
    // Provide HttpClient with interceptors
    provideHttpClient(withInterceptors([authInterceptor])),
    // Provide router with the defined routes
    provideRouter(routes),
    
    // Provide animations for Material components
  ]
}).catch(err => console.error(err));
