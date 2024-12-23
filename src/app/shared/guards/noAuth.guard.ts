import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/pages/auth/services/auth.service';

/**
 * A guard that prevents users from accessing routes that require authentication.
 *
 * The guard checks if the user is authenticated before allowing them to access
 * a certain route. If the user is authenticated, the guard resolves to a
 * URL tree that represents the root route, effectively redirecting the user to
 * the root route. If the user is not authenticated, the guard resolves to
 * `true`, allowing the user to access the route.
 *
 * @param {object} route The route that the user is trying to access.
 * @param {object} state The state of the application.
 * @returns {Observable<boolean>} An observable that resolves to a boolean indicating
 * whether the user is authenticated or not. If the user is not authenticated,
 * the observable will resolve to a URL tree that the user should be redirected
 * to.
 */
export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router: Router = inject(Router);

  return inject(AuthService).check().pipe(
    switchMap((authenticated) => {
      if (authenticated) {
        return of(router.parseUrl(''));
      }
      return of(true);
    }),
  );
};
