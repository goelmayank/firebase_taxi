import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DropOffPage } from '../drop-off/drop-off';
import { TripService } from "../../services/trip-service";
/*
 Generated class for the PickUpPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-pick-up',
  templateUrl: 'pick-up.html'
})
export class PickUpPage {
  // trip info
  trip: any;
  passenger: any;

  constructor(public nav: NavController, public tripService: TripService) {
    this.trip = tripService.getCurrentTrip();
    tripService.getPassenger(this.trip.passengerId).take(1).subscribe(snapshot => {
      this.passenger = snapshot;
    })
  }

  // pickup
  pickup() {
    this.tripService.pickUp(this.trip.$key);
    this.nav.setRoot(DropOffPage);
  }
}
