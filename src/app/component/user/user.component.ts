import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NotificationType } from '../../enum/notification-type.enum';
import { CustomHttpResponse } from '../../model/custom-http-response';
import { User } from '../../model/user';
import { AuthenticationService } from '../../service/authentication.service';
import { NotificationService } from '../../service/notification.service';
import { UserService } from '../../service/user.service';
import { FileUploadStatus } from '../../model/file-upload.status';
import { SubSink } from 'subsink';
import { Role } from 'src/app/enum/role.enum';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit, OnDestroy {
  
  private subs = new SubSink();
  public refreshing: boolean;
  public user: User;
  public users: User[];
  private currentUserName: string;
  public selectedUser: User;
  public fileName: string;
  public fileStatus = new FileUploadStatus();
  public profileImage: File;
  public editUser = new User();
  
  public currentUserPage = 1;
  public totalUsers = 0;
  public usersPerPage = 4;


constructor(private authenticationService: AuthenticationService, private userService: UserService, private notificationService: NotificationService) { }

  public ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getUsers(true);
    
  }

public getUsers(showNotification: boolean): void {
  this.refreshing = true;
  this.subs.add(
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.userService.addUserToLocalCache(response);
        this.users = response;
        this.totalUsers = this.users.length;
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
  );
}

public onUserTableDataChange(event:any){
  this.currentUserPage = event;
  this.getUsers(false);
}

public onSelectUser(selectedUser: User):void {
  this.selectedUser = selectedUser;
  this.clickButton('openUserInfo');
}

public saveNewUser(): void {
  this.clickButton('new-user-save');
}

public onAddNewUser(userForm: NgForm): void {
  const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
  this.subs.add(
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
        user.role.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
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
  this.subs.add(
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

public onEditUser(editUser: User):void {
  this.editUser = editUser;
  this.currentUserName = editUser.userName;
  this.clickButton('openUserEdit');
}

public onProfileImageChange(event:any):void {
  this.fileName = (<HTMLInputElement>event.target).files[0].name;
  this.profileImage= (<HTMLInputElement>event.target).files[0];
}

public onDeleteUser(userName: string):void {
  this.subs.add(
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

public updateProfileImage():void {
  this.clickButton('profile-image-input');
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

private clickButton(buttonId: string): void {
  document.getElementById(buttonId).click();
}

public ngOnDestroy(): void {
  this.subs.unsubscribe();
}

}
