import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";

@Injectable()
export class DriverService {

  constructor(public db: AngularFireDatabase) {

  }

  // get driver by id
  getDriver(id) {
    return this.db.object('drivers/' + id);
  }

  // get driver position
  getDriverPosition(locality, vehicleType, id) {
    return this.db.object('localities/' + locality + '/' + vehicleType + '/' + id);
  }

  getActiveDriver(locality, vehicleType) {
    return this.db.list('localities/' + locality + '/' + vehicleType);
  }

  // calculate vehicle angle
  calcAngle(oldLat, oldLng, lat, lng) {
    let brng = Math.atan2(lat - oldLat, lng - oldLng);
    brng = brng * (180 / Math.PI);

    return brng;
  }

  // return icon suffix by angle
  getIconWithAngle(vehicle) {
    let angle = this.calcAngle(vehicle.oldLat, vehicle.oldLng, vehicle.lat, vehicle.lng);

    if (angle >= -180 && angle <= -160) {
      return '_left';
    }

    if (angle > -160 && angle <= -110) {
      return '_bottom_left';
    }

    if (angle > -110 && angle <= -70) {
      return '_bottom';
    }

    if (angle > -70 && angle <= -20) {
      return '_bottom_right';
    }

    if (angle >= -20 && angle <= 20) {
      return '_right';
    }

    if (angle > 20 && angle <= 70) {
      return '_top_right';
    }

    if (angle > 70 && angle <= 110) {
      return '_top';
    }

    if (angle > 110 && angle <= 160) {
      return '_top_left';
    }

    if (angle > 160 && angle <= 180) {
      return '_left';
    }
  }
}