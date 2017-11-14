import { Component } from '@angular/core';
import { NavController, NavParams, App, ViewController } from 'ionic-angular';
import { TripService } from "../../services/trip-service";

/*
 Generated class for the ModalRatingPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-modal-rating',
  templateUrl: 'modal-rating.html'
})
export class ModalRatingPage {
  // user info
  driver: any;
  // trip info
  trip: any;
  // rating
  rating: number = 0;

  constructor(public nav: NavController, public navParams: NavParams, public tripService: TripService,
              public viewCtrl: ViewController, public app: App) {
    // get params from navParams
    this.driver = navParams.get('driver');
    this.trip = navParams.get('trip');
  }

  // call when click to stars
  rate(star) {
    this.rating = star;
  }

  // submit rating
  submit() {
    this.tripService.rateTrip(this.trip.$key, this.rating).then(() => {
      this.viewCtrl.dismiss();
    });
  }
}
