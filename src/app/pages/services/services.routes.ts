import { Route } from '@angular/router';
import { ServicesComponent } from './services.component';
import { ServiceLogComponent } from './components/service-log/service-log.component';

const routes: Route[] = [
  {
    path: '',
    component: ServicesComponent,
  },
  {
    path: ':id/log',
    component: ServiceLogComponent,
  },
];

export default routes;
