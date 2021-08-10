import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  private usersSubject = new BehaviorSubject<string>('Users');
  public titleActionUsers$ = this.usersSubject.asObservable();

  private sensorsSubject = new BehaviorSubject<string>('Sensors');
  public titleActionSubject$ = this.sensorsSubject.asObservable();

  private settingsSubject = new BehaviorSubject<string>('Settings');
  public titleActionSettings$ = this.settingsSubject.asObservable();


  private profileSubject = new BehaviorSubject<string>('Profile');
  public titleActionProfile$ = this.profileSubject.asObservable();

  public user: User;
  public isLoggedIn:boolean;

  constructor(private router: Router, private authenticationService: AuthenticationService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.isLoggedIn = this.authenticationService.isUserLoggedIn();
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`)
  }

  public openUsers(title:string): void {
    this.router.navigate(['/user/management']);
    this.usersSubject.next(title);
  }

  public openPasswordSettings(title:string): void {
    this.router.navigate(['/user/settings']);
    this.settingsSubject.next(title);
  }

  public openUserProfile(title:string): void {
    this.router.navigate(['/user/profile']);
    this.profileSubject.next(title);
  }

  public openSensors(title:string):void {
    this.router.navigate(['/sensor/management']);
    this.sensorsSubject.next(title); 
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN;
  }
  
  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendNotification(notificationType: NotificationType, message: any): void {
    if(message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An Error Occured. Please try again.');
    }
  }

}


