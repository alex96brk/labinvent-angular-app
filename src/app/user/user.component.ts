import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { flatten } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { CustomHttpResponse } from '../model/custom-http-response';
import { User } from '../model/user';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[];
  public user: User;
  public refreshing: boolean;
  private subsctriptions: Subscription[] = [];
  public selectedUser: User;
  public fileName: string;
  public profileImage: File;
  public editUser = new User();
  private currentUserName: string;
  public fileStatus = new FileUploadStatus();

  constructor(private router: Router, private authenticationService: AuthenticationService, private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getUsers(true);
  }

public changeTitle(title:string): void {
  this.titleSubject.next(title);
}

public getUsers(showNotification: boolean): void {
  this.refreshing = true;
  this.subsctriptions.push(
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.userService.addUserToLocalCache(response);
        this.users = response;
        this.refreshing = false;
        if(showNotification) {
          this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded sucessfully.`)
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing = false;
      }
    )
  )
}

public onSelectUser(selectedUser: User):void {
  this.selectedUser = selectedUser;
  this.clickButton('openUserInfo');
}

public onProfileImageChange(event:any):void {
  this.fileName = (<HTMLInputElement>event.target).files[0].name;
  this.profileImage= (<HTMLInputElement>event.target).files[0];
}

public updateProfileImage():void {
  this.clickButton('profile-image-input');
}

public changeProfileImage():void {
  this.clickButton('profile-image-change');
}

public onUpdateProfileImage(event:any) {
  const formData = new FormData();
  formData.append('userName', this.user.userName);
  formData.append('profileImage', this.profileImage = (<HTMLInputElement>event.target).files[0]);
  this.subsctriptions.push(
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


public saveNewUser(): void {
  this.clickButton('new-user-save');
}

public onAddNewUser(userForm: NgForm): void {
  const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
  this.subsctriptions.push(
    this.userService.addUser(formData).subscribe(
      (response: User) => {
        this.clickButton('new-user-close');
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        userForm.reset();
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} added successfully`);

      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
      }
    )
    
  );
  
}

public searchUsers(searchTerm:string):void {
  const results: User[] = [];
  for (const user of this.userService.getUsersFromLocalCache()) {
    if(user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
    }
  }
  this.users = results;
  if (results.length === 0 || !searchTerm) {
    this.users = this.userService.getUsersFromLocalCache();
  }
}

public onUpdateUser():void {
  const formData = this.userService.createUserFormData(this.currentUserName, this.editUser, this.profileImage);
  this.subsctriptions.push(
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.clickButton('closeEditUserModalButton');
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
      }
    )
  ); 
}

public onUpdateCurrentUser(user: User): void {
  this.refreshing = true;
  this.currentUserName = this.authenticationService.getUserFromLocalCache().userName;
  const formData = this.userService.createUserFormData(this.currentUserName, this.user, this.profileImage);
  this.subsctriptions.push(
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.authenticationService.addUserToLocalCache(response);
        this.getUsers(false);
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

public onEditUser(editUser: User):void {
  this.editUser = editUser;
  this.currentUserName = editUser.userName;
  this.clickButton('openUserEdit');
}

public onLogOut(): void {
  this.authenticationService.logOut();
  this.router.navigate(['/login']);
  this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`)
}

public onResetPassword(emailForm: NgForm):void {
  this.refreshing = true;
  const emailAddress = emailForm.value['reset-password-email'];
  this.subsctriptions.push(
    this.userService.resetPassword(emailAddress).subscribe(
      (response: CustomHttpResponse) => {
        this.sendNotification(NotificationType.SUCCESS, response.message)
        this.refreshing= false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
        this.refreshing = false;
      },
      () => emailForm.reset()
    )
  );
  
}

public onDeleteUser(userName: string):void {
  this.subsctriptions.push(
    this.userService.deleteUser(userName).subscribe(
      (response: CustomHttpResponse) => {
        this.sendNotification(NotificationType.SUCCESS, response.message.toLowerCase());
        this.getUsers(true);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
      }
    )
  )
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
    default:
      `All process finished`;
  }
}

private sendNotification(notificationType: NotificationType, message: any): void {
  if(message) {
    this.notificationService.notify(notificationType, message);
  } else {
    this.notificationService.notify(notificationType, 'An Error Occured. Please try again.');
  }
}

private clickButton(buttonId: string): void {
  document.getElementById(buttonId).click();
}


}
