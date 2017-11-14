import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { PlaceService } from "../../services/place-service";
import { HomePage } from "../home/home";
import { TripService } from "../../services/trip-service";
declare var google: any;
/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  map: any;

  // pin address
  address: any;

  // marker position on screen
  markerFromTop = 0;
  markerFromLeft = 0;

  constructor(public nav: NavController, private geolocation: Geolocation, public chRef: ChangeDetectorRef,
              public navParams: NavParams, public placeService: PlaceService, public tripService: TripService) {
  }

  // Load map only after view is initialized
  ionViewDidLoad() {
    this.loadMap();

    // set marker position in center of screen
    // minus marker's size
    this.markerFromTop = window.screen.height / 2 - 16;
    this.markerFromLeft = window.screen.width / 2 - 8;
  }

  loadMap() {
    // set current location as map center
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoomControl: false,
      });

      // get center's address
      this.findPlace(latLng);

      this.map.addListener('center_changed', (event) => {
        let center = this.map.getCenter();
        this.findPlace(center);
      })
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  // find address by LatLng
  findPlace(latLng) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latLng}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        this.address = results[0];
        this.chRef.detectChanges();
      }
    });
  }

  // choose address and go back to home page
  selectPlace() {
    let address = this.placeService.formatAddress(this.address);

    if (this.navParams.get('type') == 'origin') {
      this.tripService.setOrigin(address.vicinity, address.location.lat, address.location.lng);
    } else {
      this.tripService.setDestination(address.vicinity, address.location.lat, address.location.lng);
    }

    this.nav.setRoot(HomePage);
  }
}
