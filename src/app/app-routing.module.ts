import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './guard/authentication.guard';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { UserComponent } from './component/user/user.component';
import { SensorComponent } from './component/sensor/sensor.component';
import { ProfileComponent } from './component/profile/profile.component';
import { SettingsComponent } from './component/settings/settings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path:'register', component: RegisterComponent },
  { path:'user/management', component: UserComponent, canActivate: [AuthenticationGuard] },
  { path:'user/profile', component: ProfileComponent, canActivate: [AuthenticationGuard] },
  { path:'user/settings', component: SettingsComponent, canActivate: [AuthenticationGuard] },
  { path:'sensor/management', component: SensorComponent, canActivate: [AuthenticationGuard] },
  { path:'', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
