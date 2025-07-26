
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {CanvasJSAngularChartsModule} from '@canvasjs/angular-charts';



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // This is important for Angular Material animations
    importProvidersFrom(
      MatSidenavModule,
      MatListModule,
      CanvasJSAngularChartsModule
      // Any other modules you might have imported globally via importProvidersFrom
    ),

  ],
};
