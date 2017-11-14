import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlacesPage } from '../places/places';
import { PaymentMethodPage } from '../payment-method/payment-method';
import { FindingPage } from "../finding/finding";
import { PlaceService } from "../../services/place-service";
import { SettingService } from "../../services/setting-service";
import { DriverService } from "../../services/driver-service";
import { TripService } from "../../services/trip-service";
import { SHOW_VEHICLES_WITHIN, POSITION_INTERVAL, VEHICLE_LAST_ACTIVE_LIMIT } from "../../services/constants";
import 'rxjs/Rx'
declare var google: any;

/*
 Generated class for the HomePage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  // map id
  mapId = Math.random() + 'map';

  // map height
  mapHeight: number = 480;

  // show - hide modal bg
  showModalBg: boolean = false;

  // show vehicles flag
  showVehicles: boolean = false;

  // list vehicles
  vehicles: any = [];

  // current vehicle type
  currentVehicle: any;

  // Note to user
  note: any = '';

  // Map
  map: any;

  // origin and destination
  origin: any;
  destination: any;

  // loading object
  loading: any;

  // distance between origin and destination
  distance: number = 0;

  // currency
  currency: string;

  // current locality
  locality: any;

  // payment method
  paymentMethod: string = 'cash';

  // active drivers list
  activeDrivers: Array<any> = [];

  // list of user markers on the map
  driverMarkers: Array<any> = [];

  // user tracking interval
  driverTracking: any;

  constructor(public nav: NavController, public platform: Platform, public alertCtrl: AlertController,
              public placeService: PlaceService, private geolocation: Geolocation, private chRef: ChangeDetectorRef,
              public loadingCtrl: LoadingController, public settingService: SettingService,
              public tripService: TripService, public driverService: DriverService) {
    this.origin = tripService.getOrigin();
    this.destination = tripService.getDestination();
  }

  ionViewDidLoad() {
    // on view ready, start loading map
    this.loadMap();
  }

  ionViewWillLeave() {
    // stop tracking driver
    clearInterval(this.driverTracking);
  }

  // get current payment method from service
  getPaymentMethod() {
    this.paymentMethod = this.tripService.getPaymentMethod()
    return this.paymentMethod;
  }

  // toggle active vehicle
  chooseVehicle(index) {
    for (var i = 0; i < this.vehicles.length; i++) {
      this.vehicles[i].active = (i == index);

      // choose this vehicle type
      if (i == index) {
        this.tripService.setVehicle(this.vehicles[i]);
        this.currentVehicle = this.vehicles[i];
      }
    }

    // start tracking new driver type
    this.trackDrivers();
    this.toggleVehicles();
  }

  // load map
  loadMap() {
    this.showLoading();

    // get current location
    return this.geolocation.getCurrentPosition().then((resp) => {
      let latLng;

      if (this.origin) {
        // set map center as origin
        latLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
      } else {
        // set map center as current location
        latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      }

      this.map = new google.maps.Map(document.getElementById(this.mapId), {
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
      });

      // get ion-view height, 44 is navbar height
      this.mapHeight = window.screen.height - 44;

      // find map center address
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': this.map.getCenter()}, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          if (!this.origin) {
            // set map center as origin
            this.origin = this.placeService.formatAddress(results[0]);
            this.tripService.setOrigin(this.origin.vicinity, this.origin.location.lat, this.origin.location.lng);
            this.setOrigin();
            this.chRef.detectChanges();
          } else {
            this.setOrigin();
          }

          // save locality
          let locality = this.placeService.setLocalityFromGeocoder(results);
          console.log('locality', locality);
          // load list vehicles
          this.settingService.getPrices().subscribe(snapshot => {
            let obj = snapshot[locality] ? snapshot[locality] : snapshot.default;
            this.currency = obj.currency;
            this.tripService.setCurrency(this.currency);

            // calculate price
            Object.keys(obj.vehicles).forEach(id => {
              obj.vehicles[id].id = id;
              this.vehicles.push(obj.vehicles[id]);
            });

            // calculate distance between origin adn destination
            if (this.destination) {
              this.placeService.getDirection(this.origin.location.lat, this.origin.location.lng, this.destination.location.lat,
                  this.destination.location.lng).subscribe(result => {
                this.distance = result.routes[0].legs[0].distance.value;

                for (let i = 0; i < this.vehicles.length; i++) {
                  this.vehicles[i].fee = this.distance * this.vehicles[i].price / 1000;
                  this.vehicles[i].fee = this.vehicles[i].fee.toFixed(2);
                }
              });
            }

            // set first device as default
            this.vehicles[0].active = true;
            this.currentVehicle = this.vehicles[0];

            this.locality = locality;
            this.trackDrivers();
          });
        }
      });

      // add destination to map
      if (this.destination) {
        new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(this.destination.location.lat, this.destination.location.lng)
        });
      }

      this.hideLoading();

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // Show note popup when click to 'Notes to user'
  showNotePopup() {
    let prompt = this.alertCtrl.create({
      title: 'Notes to user',
      message: "",
      inputs: [
        {
          name: 'note',
          placeholder: 'Note'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.note = data;
            this.tripService.setNote(data);
            console.log('Saved clicked');
          }
        }
      ]
    });

    prompt.present();
  };

  // go to next view when the 'Book' button is clicked
  book() {
    // store detail
    this.tripService.setAvailableDrivers(this.activeDrivers);
    this.tripService.setDistance(this.distance);
    this.tripService.setFee(this.currentVehicle.fee);
    this.tripService.setIcon(this.currentVehicle.icon);
    this.tripService.setNote(this.note);
    // this.tripService.setPaymentMethod('');

    // go to finding page
    this.nav.setRoot(FindingPage);
  }

  // choose origin place
  chooseOrigin() {
    // go to places page
    this.nav.push(PlacesPage, {type: 'origin'});
  }

  // choose destination place
  chooseDestination() {
    // go to places page
    this.nav.push(PlacesPage, {type: 'destination'});
  }

  // choose payment method
  choosePaymentMethod() {
    // go to payment method page
    this.nav.push(PaymentMethodPage);
  }

  // add origin marker to map
  setOrigin() {
    // add origin and destination marker
    let latLng = new google.maps.LatLng(this.origin.location.lat, this.origin.location.lng);
    new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng,
      icon: 'assets/img/pin.png'
    });

    // set map center to origin address
    this.map.setCenter(latLng);
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present();
  }

  hideLoading() {
    this.loading.dismiss();
  }

  // show or hide vehicles
  toggleVehicles() {
    this.showVehicles = !this.showVehicles;
    this.showModalBg = (this.showVehicles == true);
  }

  // track drivers
  trackDrivers() {
    this.showDriverOnMap(this.locality);
    clearInterval(this.driverTracking);

    this.driverTracking = setInterval(() => {
      this.showDriverOnMap(this.locality);
    }, POSITION_INTERVAL);

    console.log(POSITION_INTERVAL);
  }

  // show drivers on map
  showDriverOnMap(locality) {
    // get active drivers
    this.driverService.getActiveDriver(locality, this.currentVehicle.id).take(1).subscribe(snapshot => {
      console.log('fresh vehicles');

      // clear vehicles
      this.clearDrivers();

      // only show near vehicle
      snapshot.forEach(vehicle => {
        // only show vehicle which has last active < 30 secs & distance < 5km
        let distance = this.placeService.calcCrow(vehicle.lat, vehicle.lng, this.origin.location.lat, this.origin.location.lng);
        if (distance < SHOW_VEHICLES_WITHIN
            && Date.now() - vehicle.last_active < VEHICLE_LAST_ACTIVE_LIMIT
        ) {
          // create or update
          let latLng = new google.maps.LatLng(vehicle.lat, vehicle.lng);
          let angle = this.driverService.getIconWithAngle(vehicle);

          let marker = new google.maps.Marker({
            map: this.map,
            position: latLng,
            icon: {
              url: 'assets/img/icon/' + this.currentVehicle.icon + angle + '.png',
              size: new google.maps.Size(32, 32),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 16),
              scaledSize: new google.maps.Size(32, 32)
            },
          });

          // add vehicle and marker to the list
          vehicle.distance = distance;
          this.driverMarkers.push(marker);
          this.activeDrivers.push(vehicle);
        } else {
          //console.log('This vehicle is too far');
        }
      });
    });
  }

  // clear expired drivers on the map
  clearDrivers() {
    this.activeDrivers = [];
    this.driverMarkers.forEach((vehicle) => {
      vehicle.setMap(null);
    });
  }
}
