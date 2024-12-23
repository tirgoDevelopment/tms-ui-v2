import { Routes } from "@angular/router";
import { AuthComponent } from "./auth.component";

export default [
  {
    path: '', component: AuthComponent,
    children: [
      { path: 'sign-in', loadChildren: () => import('./components/sign-in/sign-in.routes').then(m => m.default) },
      { path: 'sign-up', loadChildren: () => import('./components/sign-up/sign-up.routes').then(m => m.default) },
      { path: 'register', loadChildren: () => import('./components/register-steps/register-steps.routes').then(m => m.default) },
    ]
  }
] as Routes;