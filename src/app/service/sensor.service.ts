import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { Observable } from 'rxjs';
import { CustomHttpResponse } from '../model/custom-http-response';
import { Sensor } from '../model/sensor';
import { SensorType } from '../model/sensortype';
import { SensorUnit } from '../model/sensorunit';

@Injectable({ providedIn: 'root' })
export class SensorService {

  private host = environment.apiUrl;

  constructor( private http: HttpClient) { }

  public getSensors(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.host}/sensor/list`);
  }

  public getSensorTypes(): Observable<SensorType[]> {
    return this.http.get<SensorType[]>(`${this.host}/sensor/sensor-types`);
  }

  public getSensorUnits(): Observable<SensorUnit[]> {
    return this.http.get<SensorUnit[]>(`${this.host}/sensor/sensor-units`);
  }

  public addSensor(formData: FormData): Observable<Sensor> {
    return this.http.post<Sensor>(`${this.host}/sensor/add`, formData);
  }

  public updateSensor(formData: FormData):Observable<Sensor> {
    return this.http.post<Sensor>(`${this.host}/sensor/update`, formData);
  }

  public deleteSensor(sensorName:string): Observable<CustomHttpResponse> {
    return this.http.delete<CustomHttpResponse>(`${this.host}/sensor/delete/${sensorName}`);
  }

  public addSensorToLocalCache(sensors: Sensor[]): void {
    localStorage.setItem('sensors', JSON.stringify(sensors));
  }

  public addSensorTypeToLocalCache(sensortypes: SensorType[]): void {
    localStorage.setItem('sensortypes', JSON.stringify(sensortypes));
  }
  public addSensorUnitsToLocalCache(sensorunits: SensorUnit[]): void {
    localStorage.setItem('sensorunits', JSON.stringify(sensorunits));
  }

  public getSensorsFromLocalCache(): Sensor[] {
    if(localStorage.getItem('sensors')) {
      return JSON.parse(localStorage.getItem('sensors'));
    }
    return null;
  }

  public createSensorFormData(currentSensor:string, sensor: Sensor): FormData {
    const sensorFormData = new FormData();
    sensorFormData.append('currentSensorName', currentSensor);
    sensorFormData.append('sensorName', sensor.sensorName);
    sensorFormData.append('sensorModel', sensor.sensorModel);
    sensorFormData.append('leftRange', JSON.stringify(sensor.leftRange));
    sensorFormData.append('rightRange', JSON.stringify(sensor.rightRange));
    sensorFormData.append('sensorType', sensor.sensorType);
    sensorFormData.append('sensorUnit', sensor.sensorUnit);
    sensorFormData.append('sensorLocation', sensor.sensorLocation);
    sensorFormData.append('sensorDescription', sensor.sensorDescription);
    return sensorFormData;
  }

}
