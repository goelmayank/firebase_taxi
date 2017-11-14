import { Component } from '@angular/core';
import { NavController, Platform, ModalController } from 'ionic-angular';
import { DriverService } from '../../services/driver-service';
import { HomePage } from "../home/home";
import { TripService } from "../../services/trip-service";
import { POSITION_INTERVAL, TRIP_STATUS_GOING, TRIP_STATUS_FINISHED } from "../../services/constants";
import { PlaceService } from "../../services/place-service";
import { ModalRatingPage } from "../modal-rating/modal-rating";
declare var google: any;

/*
 Generated class for the TrackingPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html'
})
export class TrackingPage {
  // map height
  mapHeight: number = 480;
  // user info
  driver: any;
  // map
  map: any;
  // trip info
  trip: any;
  // user tracking interval
  driverTracking: any;
  // user marker on map
  marker: any;
  // trip status
  tripStatus: any;
  // trip subscription
  tripSubscription: any;

  constructor(public nav: NavController, public driverService: DriverService, public platform: Platform,
              public tripService: TripService, public placeService: PlaceService, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    let tripId = this.tripService.getId();
    this.tripService.getTrip(tripId).take(1).subscribe(snapshot => {
      this.trip = snapshot;

      this.driverService.getDriver(snapshot.driverId).take(1).subscribe(snap => {
        console.log(snap);
        this.driver = snap;
        this.watchTrip(tripId);
        // init map
        this.loadMap();
      })
    });

  }

  ionViewWillLeave() {
    //this.tripSubscription.unsubscribe();
    clearInterval(this.driverTracking);
  }

  watchTrip(tripId) {
    this.tripSubscription = this.tripService.getTrip(tripId).subscribe(snapshot => {
      this.tripStatus = snapshot.status;

      // if trip has been finished
      if (this.tripStatus == TRIP_STATUS_FINISHED) {
        this.tripSubscription.unsubscribe();
        this.showRatingModal();
      }
    });
  }

  showRatingModal() {
    console.log(this.trip, this.driver);
    let modal = this.modalCtrl.create(ModalRatingPage, {
      trip: this.trip,
      driver: this.driver
    });
    modal.onDidDismiss(data => {
      this.nav.setRoot(HomePage)
    });
    modal.present();
  }

  loadMap() {
    let latLng = new google.maps.LatLng(this.trip.origin.location.lat, this.trip.origin.location.lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false
    }

    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // get ion-view height
    let viewHeight = window.screen.height - 44; // minus nav bar
    // get info block height
    let infoHeight = document.getElementsByClassName('tracking-info')[0].scrollHeight;

    this.mapHeight = viewHeight - infoHeight;

    new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: 'assets/img/pin.png'
    });

    this.trackDriver();
  }

  // make array with range is n
  range(n) {
    return new Array(Math.round(n));
  }

  trackDriver() {
    this.showDriverOnMap();

    this.driverTracking = setInterval(() => {
      this.marker.setMap(null);
      this.showDriverOnMap();
    }, POSITION_INTERVAL);

    console.log(POSITION_INTERVAL);
  }

  // show user on map
  showDriverOnMap() {
    // get user's position
    this.driverService.getDriverPosition(
        this.placeService.getLocality(),
        this.driver.type,
        this.driver.$key
    ).take(1).subscribe(snapshot => {
      // create or update
      let latLng = new google.maps.LatLng(snapshot.lat, snapshot.lng);
      let angle = this.driverService.getIconWithAngle(snapshot);

      if (this.tripStatus == TRIP_STATUS_GOING) {
        console.log(this.tripStatus);
        this.map.setCenter(latLng);
      }

      // show vehicle to map
      this.marker = new google.maps.Marker({
        map: this.map,
        position: latLng,
        icon: {
          url: 'assets/img/icon/' + this.tripService.getIcon() + angle + '.png',
          size: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 16),
          scaledSize: new google.maps.Size(32, 32)
        },
      });
    });
  }
}