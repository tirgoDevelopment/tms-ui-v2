import { Route } from "@angular/router";
import { MainComponent } from "./shared/components/main/main.component";
import { AuthComponent } from "./pages/auth/auth.component";
import { NoAuthGuard } from "./shared/guards/noAuth.guard";
import { AuthGuard } from "./shared/guards/auth.guard";

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'drivers', loadChildren: () => import('./pages/drivers/drivers.routes').then(m => m.default), canActivate: [AuthGuard] },
      { path: 'services', loadChildren: () => import('./pages/services/services.routes').then(m => m.default), canActivate: [AuthGuard] },
      { path: 'support', loadChildren: () => import('./pages/support/support.routes').then(m => m.default), canActivate: [AuthGuard] },
      { path: 'settings', loadChildren: () => import('./pages/settings/settings.routes').then(m => m.default), canActivate: [AuthGuard] },
    ]
  },
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.default)},
]