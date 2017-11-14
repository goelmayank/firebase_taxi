import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DriverService } from '../../services/driver-service';
import { TrackingPage } from '../tracking/tracking';
import { TripService } from "../../services/trip-service";

/*
 Generated class for the DriverPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-driver',
  templateUrl: 'driver.html'
})
export class DriverPage {
  driver: any;
  // trip info
  trip: any
  navTimeout: any;

  constructor(public nav: NavController, public driverService: DriverService, public tripService: TripService) {

    let tripId = this.tripService.getId();
    // get current trip
    this.tripService.getTrip(tripId).take(1).subscribe(snapshot => {
      this.trip = snapshot;

      // get driver from trip
      this.driverService.getDriver(snapshot.driverId).take(1).subscribe(snap => {
        this.driver = snap;
      })
    });

    // after 5 seconds, go to trcking page
    this.navTimeout = setTimeout(() => {
      this.track();
    }, 5000);
  }

  ionViewWillLeave() {
    clearTimeout(this.navTimeout);
  }

  track() {
    this.nav.setRoot(TrackingPage);
  }

  // make array with range is n
  range(n) {
    return new Array(Math.round(n));
  }
}
