export class User {
    public userId: string;
    public firstName: string;
    public lastName: string;
    public userName: string;
    public email: string;
    public lastLoginDate:string;
    public lastLoginDateDisplay: Date;
    public joinDate: Date;
    public userProfileImageUrl: string;
    public active: boolean;
    public notLocked: boolean;
    public role: string; 
    public authorities: [];

    constructor() {
        this.userId = '';
        this.firstName = '';
        this.lastName = '';
        this.userName = '';
        this.email = '';
        this.lastLoginDate = null;
        this.lastLoginDateDisplay = null;
        this.joinDate = null;
        this.userProfileImageUrl = null;
        this.active = false;
        this.notLocked = false;
        this.role = '';
        this.authorities = [];
    }
    
}