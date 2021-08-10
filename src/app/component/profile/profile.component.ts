import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { FileUploadStatus } from 'src/app/model/file-upload.status';
import { User } from 'src/app/model/user';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { UserService } from 'src/app/service/user.service';
import { SubSink } from 'subsink';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  public user: User;
  public userRole:string;
  public refreshing: boolean;
  private currentUserName: string;
  public profileImage: File;
  public fileName: string;
  public fileStatus = new FileUploadStatus();
  

  constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService, private notificationService: NotificationService) { }

  public ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.userRole = this.user.role.replace('ROLE_','');
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUserName = this.authenticationService.getUserFromLocalCache().userName;
    const formData = this.userService.createUserFormData(this.currentUserName, this.user, this.profileImage);
    this.subs.add(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          this.fileName = null;
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.profileImage = null;
          this.refreshing = false;
        }
      )
    ); 
  }

  public changeProfileImage():void {
    this.clickButton('profile-image-change');
  }

  private reportUploadProgress(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress: 
        this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response: 
        if(event.status === 200) {
          this.user.userProfileImageUrl = `${event.body.userProfileImageUrl}?time=${new Date().getTime()}`;
          this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName}\'s profile image updated successfully`);
          this.fileStatus.status = 'done';
          break;
        } else {
          this.sendNotification(NotificationType.ERROR, `Unable to upload image. Please try again.`);
          break;
        }
      default: `All process finished`; 
    }
  }

  public onUpdateProfileImage(event:any) {
    const formData = new FormData();
    formData.append('userName', this.user.userName);
    formData.append('profileImage', this.profileImage = (<HTMLInputElement>event.target).files[0]);
    this.subs.add(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
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

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
