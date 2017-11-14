import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database/database";
import { TRIP_STATUS_WAITING, TRIP_STATUS_GOING, TRIP_STATUS_FINISHED } from "./constants";
import { AuthService } from "./auth-service";

@Injectable()
export class TripService {
  currentTrip: any;

  constructor(public db: AngularFireDatabase, public authService: AuthService) {
  }

  // create trip from deal object
  createFromDeal(deal) {
    deal.status = TRIP_STATUS_WAITING;
    return this.db.list('trips').push(deal);
  }

  // pickup passenger
  pickUp(tripId) {
    this.db.object('trips/' + tripId).update({
      pickedUpAt: Date.now(),
      status: TRIP_STATUS_GOING
    })
  }

  // drop off
  dropOff(tripId) {
    this.db.object('trips/' + tripId).update({
      droppedOffAt: Date.now(),
      status: TRIP_STATUS_FINISHED
    })
  }

  setCurrentTrip(tripId) {
    return this.db.object('trips/' + tripId).take(1).subscribe(snapshot => {
      this.currentTrip = snapshot;
    });
  }

  getCurrentTrip() {
    console.log(this.currentTrip);
    return this.currentTrip;
  }

  getPassenger(passengerId) {
    return this.db.object('passengers/' + passengerId);
  }

  // get driver's trip
  getTrips() {
    let user = this.authService.getUserData();
    return this.db.list('trips', {
      query: {
        orderByChild: 'driverId',
        equalTo: user.uid,
      }
    });
  }
}