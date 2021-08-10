
export class Sensor {

    public sensorId:string;

    public sensorName:string;

    public sensorModel:string;

    public leftRange:number;

    public rightRange:number;

    public sensorType: string;

    public sensorUnit: string;

    public sensorLocation:string;

    public sensorDescription:string;

    constructor() {
        this.sensorId='',
        this.sensorName='',
        this.sensorModel='',
        this.leftRange= 0,
        this.rightRange= 0,
        this.sensorType = 'default',
        this.sensorUnit = 'default',
        this.sensorLocation='',
        this.sensorDescription=''
    }

}