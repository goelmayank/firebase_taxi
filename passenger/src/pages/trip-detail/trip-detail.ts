import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DriverService } from "../../services/driver-service";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-trip-detail',
  templateUrl: 'trip-detail.html',
})
export class TripDetailPage {
  trip: any;
  driver: any;

  constructor(public nav: NavController, public navParams: NavParams, public driverService: DriverService) {
    this.trip = navParams.get('trip');
    this.driverService.getDriver(this.trip.driverId).take(1).subscribe(snapshot => {
      this.driver = snapshot;
    });
  }

  // make array with range is n
  range(n) {
    return new Array(Math.round(n));
  }
}