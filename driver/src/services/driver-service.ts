import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import { AuthService } from "./auth-service";

@Injectable()
export class DriverService {
  user: any;

  constructor(public db: AngularFireDatabase, public authService: AuthService) {
    this.user = this.authService.getUserData();
  }

  setUser(user) {
    this.user = user;
  }

  // get driver by id
  getDriver() {
    let user = this.authService.getUserData();
    return this.db.object('drivers/' + user.uid);
  }

  // update driver's position
  updatePosition(vehicleId, vehicleType, locality, lat, lng, rating, name) {
    let path = 'localities/' + locality + '/' + vehicleType + '/' + vehicleId;
    console.log('tracking', lat, lng);
    this.db.object(path).take(1).subscribe(snapshot => {

      // insert if not exists
      if (snapshot.$value === null) {
        this.db.object(path).set({
          lat: lat,
          lng: lng,
          oldLat: lat,
          oldLng: lng,
          last_active: Date.now(),
          rating: rating,
          name: name
        });

      } else {
        // update
        this.db.object(path).update({
          lat: lat,
          lng: lng,
          oldLat: snapshot.lat,
          oldLng: snapshot.lng,
          last_active: Date.now(),
          rating: rating,
          name: name
        });
      }
    });
  }
}
