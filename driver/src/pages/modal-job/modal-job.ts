import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { DEAL_TIMEOUT } from "../../services/constants";
import { PlaceService } from "../../services/place-service";

/*
 Generated class for the ModalJobPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-modal-job',
  templateUrl: 'modal-job.html'
})
export class ModalJobPage {
  // job info
  public job: any;

  // remaining time for countdown
  public remainingTime = DEAL_TIMEOUT;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public placeService: PlaceService,
              public geolocation: Geolocation) {
    this.job = navParams.get('deal');

    // get current location
    geolocation.getCurrentPosition().then((resp) => {
      //resp.coords.longitude
      this.job.origin.distance = this.placeService.calcCrow(
          resp.coords.latitude,
          resp.coords.longitude,
          this.job.origin.location.lat,
          this.job.origin.location.lng).toFixed(0);
      this.job.destination.distance = this.placeService.calcCrow(
          resp.coords.latitude,
          resp.coords.longitude,
          this.job.destination.location.lat,
          this.job.destination.location.lng).toFixed(0);
    }, err => {
      console.log(err);
    });

    // start count down
    this.countDown();
  }

  // close modal
  close() {
    this.viewCtrl.dismiss();
  }

  // count down
  countDown() {
    let interval = setInterval(() => {
      this.remainingTime--;

      // if time is over
      if (this.remainingTime == 0) {
        // stop interval
        clearInterval(interval)
        this.viewCtrl.dismiss();
      }
    }, 1000);
  }

  // accept job
  accept() {
    // close and accept a job
    this.viewCtrl.dismiss(true);
  }
}
