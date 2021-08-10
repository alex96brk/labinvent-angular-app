import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { CustomHttpResponse } from 'src/app/model/custom-http-response';
import { Sensor } from 'src/app/model/sensor';
import { SensorType } from 'src/app/model/sensortype';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { NotificationService } from 'src/app/service/notification.service';
import { SensorService } from 'src/app/service/sensor.service';
import { SubSink } from 'subsink';
import { transform } from 'typescript';
import { SensorUnit } from '../../model/sensorunit';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.css']
})
export class SensorComponent implements OnInit {

  private subs = new SubSink();
  public refreshing: boolean = true;

  public sensors: Sensor[];
  public currentSensorName: string;
  public editSensor: Sensor = new Sensor();
  public sensortypes: SensorType[];
  public sensorunits: SensorUnit[];
  public selectedSensor: Sensor;
  
  public currentSensorPage: number = 1;
  public totalSensors:number = 0;
  public sensorsPerPage = 4;

  public editSensorTypeName:string;
  public editSensorUnitName:string;

  constructor( private sensorService: SensorService, private authenticationService: AuthenticationService, private notificationService: NotificationService) { }
  ngOnInit(): void {
    this.getSensors(true);
    this.getSensorTypes(false);
    this.getSensorUnits(false);
  }

  public getSensors(showNotification: boolean): void {
    this.refreshing = true;
    this.subs.add(
      this.sensorService.getSensors().subscribe(
        (response: Sensor[]) => {
          this.sensorService.addSensorToLocalCache(response);
          this.sensors = response;
          this.totalSensors = this.sensors.length;
          this.refreshing = false;
          if(showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} sensor(s) loaded sucessfully.`)
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public getSensorTypes(showNotification: boolean): void {
    this.refreshing = true;
    this.subs.add(
      this.sensorService.getSensorTypes().subscribe(
        (response: SensorType[]) => {
          this.sensorService.addSensorTypeToLocalCache(response);
          this.sensortypes = response;
          this.refreshing = false;
          if(showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} sensor type(s) loaded sucessfully.`)
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public getSensorUnits(showNotification: boolean): void {
    this.refreshing = true;
    this.subs.add(
      this.sensorService.getSensorUnits().subscribe(
        (response: SensorUnit[]) => {
          this.sensorService.addSensorUnitsToLocalCache(response);
          this.sensorunits = response;
          this.refreshing = false;
          if(showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} sensor unit(s) loaded sucessfully.`)
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );
  }

  public onAddNewSensor(newSensorForm: NgForm): void {
    const formData = this.sensorService.createSensorFormData(null, newSensorForm.value);
    this.subs.add(
      this.sensorService.addSensor(formData).subscribe(
        (response: Sensor) => {
          this.clickButton('new-sensor-close');
          this.getSensors(false);
          newSensorForm.reset();
          this.sendNotification(NotificationType.SUCCESS, `${response.sensorName} added successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    );
  }

  public onEditSensor(appSensor: Sensor):void {
  this.editSensor = appSensor;
  this.currentSensorName = appSensor.sensorName;
  this.clickButton('openSensorEdit');
}

  public onSensorTableDataChange(event:any){
    this.currentSensorPage = event;
    this.getSensors(false);
  }

  public onUpdateSensor():void {
    const formData = this.sensorService.createSensorFormData(this.currentSensorName, this.editSensor);
    this.subs.add(
      this.sensorService.updateSensor(formData).subscribe(
        (response: Sensor) => {
          this.clickButton('closeEditSensorModalButton');
          this.getSensors(false);
          this.sendNotification(NotificationType.SUCCESS, `${response.sensorName} updated successfully`);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    ); 
  }
  public onSelectSensor(selectedSensor: Sensor):void {
    this.selectedSensor = selectedSensor;
    this.clickButton('openSensorInfo');
  }
  
  public saveNewSensor(): void {
    this.clickButton('new-sensor-save');
  }
  
  public onDeleteSensor(sensorName: string):void {
    this.subs.add(
      this.sensorService.deleteSensor(sensorName).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message.toLowerCase());
          this.getSensors(true);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    )
  }

  public searchSensors(sensorSearchTerm:string):void {
    const results: Sensor[] = [];
    for (const sensor of this.sensorService.getSensorsFromLocalCache()) {
      
      if(
          sensor.sensorName.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.sensorModel.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.leftRange.toString().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.rightRange.toString().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.sensorType.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.sensorUnit.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.sensorDescription.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1 ||
          sensor.sensorLocation.toLowerCase().indexOf(sensorSearchTerm.toLowerCase()) !== -1) {
          results.push(sensor);
      }
    }
    this.sensors = results;
    if (results.length === 0 || !sensorSearchTerm) {
      this.sensors = this.sensorService.getSensorsFromLocalCache();
    }
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
