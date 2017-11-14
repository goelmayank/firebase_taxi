import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
declare var google: any;

// angularfire2
import { AngularFireAuth } from "angularfire2/auth/auth";

// constant
import { POSITION_INTERVAL, TRIP_STATUS_WAITING, TRIP_STATUS_GOING } from "../services/constants";

// import service
import { AuthService } from "../services/auth-service";
import { PlaceService } from "../services/place-service";
import { DriverService } from "../services/driver-service";

// import page
import { HomePage } from '../pages/home/home';
import { WalletPage } from '../pages/wallet/wallet';
import { JobHistoryPage } from '../pages/job-history/job-history';
import { SettingPage } from '../pages/setting/setting';
import { SupportPage } from '../pages/support/support';
import { LoginPage } from '../pages/login/login';
import { UserPage } from "../pages/user/user";
import { TripService } from "../services/trip-service";
import { PickUpPage } from "../pages/pick-up/pick-up";
import { DropOffPage } from "../pages/drop-off/drop-off";

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content')
  }
})

export class MyApp {
  rootPage: any;
  nav: any;
  positionTracking: any;
  driver: any;
  user: any = {};
  pages = [
    {
      title: 'Home',
      icon: 'ios-home-outline',
      count: 0,
      component: HomePage
    },
    {
      title: 'Wallet',
      icon: 'ios-albums',
      count: 0,
      component: WalletPage
    },
    {
      title: 'Job history',
      icon: 'md-time',
      count: 0,
      component: JobHistoryPage
    },
    {
      title: 'Setting',
      icon: 'settings',
      count: 0,
      component: SettingPage
    },
    {
      title: 'Support',
      icon: 'ios-help-circle-outline',
      count: 0,
      component: SupportPage
    },
  ];

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, placeService: PlaceService,
              geolocation: Geolocation, driverService: DriverService, afAuth: AngularFireAuth,
              public authService: AuthService, tripService: TripService) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // check for login stage, then redirect
      afAuth.authState.take(1).subscribe(authData => {
        if (authData) {
          let root: any = HomePage;

          // check for uncompleted trip
          tripService.getTrips().take(1).subscribe(trips => {
            trips.forEach(trip => {
              if (trip.status == TRIP_STATUS_WAITING) {
                tripService.setCurrentTrip(trip.$key);
                root = PickUpPage;
              } else if (trip.status == TRIP_STATUS_GOING) {
                tripService.setCurrentTrip(trip.$key);
                root = DropOffPage;
              }
            });

            // if all trip are completed, go to home page
            this.nav.setRoot(root);
          });
        } else {
          this.nav.setRoot(LoginPage);
        }
      });

      // get user data
      afAuth.authState.subscribe(authData => {
        console.log(authData);
        if (authData) {
          this.user = authService.getUserData();

          // get user info from service
          driverService.setUser(this.user);
          driverService.getDriver().subscribe(snapshot => {
            this.driver = snapshot;
          });
        } else {
          this.driver = null;
        }
      });

      // get current location
      geolocation.getCurrentPosition().then((resp) => {
        let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
        let geocoder = new google.maps.Geocoder();

        // find address from lat lng
        geocoder.geocode({'latLng': latLng}, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
            // save locality
            let locality = placeService.setLocalityFromGeocoder(results);
            console.log('locality', locality);

            // start tracking
            this.positionTracking = setInterval(() => {
              // check for driver object, if it did not complete profile, stop updating location
              if (!this.driver || !this.driver.type) {
                return;
              }

              geolocation.getCurrentPosition().then((resp) => {
                driverService.updatePosition(this.driver.$key, this.driver.type, locality, resp.coords.latitude,
                    resp.coords.longitude, this.driver.rating, this.driver.name);
              }, err => {
                console.log(err);
              });
            }, POSITION_INTERVAL);
          }
        });
      }, err => {
        console.log(err);
      });
    });
  }

  /**
   * Open a page
   * @param page component
   */
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  /**
   * View current user profile
   */
  viewProfile() {
    this.nav.push(UserPage, {
      user: this.user
    });
  }

  /**
   * Logout this app
   */
  logout() {
    this.authService.logout().then(() => {
      this.nav.setRoot(LoginPage);
    });
  }
}

