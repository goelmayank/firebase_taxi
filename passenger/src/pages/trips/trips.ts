import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { TripService } from '../../services/trip-service';
import { TripDetailPage } from "../trip-detail/trip-detail";
import 'rxjs/add/operator/map';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-trips',
  templateUrl: 'trips.html',
})
export class TripsPage {
  // list of trips
  trips: Array<any>;

  constructor(public nav: NavController, public tripService: TripService) {
    this.tripService.getTrips().take(1).subscribe(snapshot => {
      this.trips = snapshot.reverse();
    });
  }

  viewTrip(trip) {
    console.log(trip);
    this.nav.push(TripDetailPage, {
      trip: trip
    })
  }
}
