import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// import pages
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { NotificationPage } from '../pages/notification/notification';
import { SupportPage } from '../pages/support/support';
import { TripsPage } from "../pages/trips/trips";
import { AngularFireAuth } from "angularfire2/auth/auth";
import { AuthService } from "../services/auth-service";
import { UserPage } from "../pages/user/user";
import { CardSettingPage } from "../pages/card-setting/card-setting";
// end import pages

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content')
  }
})

export class MyApp {
  rootPage: any;
  nav: any;
  user = {};
  pages = [
    {
      title: 'Home',
      icon: 'ios-home-outline',
      count: 0,
      component: HomePage
    },
    {
      title: 'History',
      icon: 'ios-time-outline',
      count: 0,
      component: TripsPage
    },
    {
      title: 'Card setting',
      icon: 'ios-card-outline',
      count: 0,
      component: CardSettingPage
    },
    {
      title: 'Notification',
      icon: 'ios-notifications-outline',
      count: 2,
      component: NotificationPage
    },
    {
      title: 'Support',
      icon: 'ios-help-circle-outline',
      count: 0,
      component: SupportPage
    },
  ];

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public afAuth: AngularFireAuth,
              public authService: AuthService) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // check for login stage, then redirect
      afAuth.authState.take(1).subscribe(authData => {
        if (authData) {
          this.nav.setRoot(HomePage);
        } else {
          this.nav.setRoot(LoginPage);
        }
      });

      // get user data
      afAuth.authState.subscribe(authData => {
        if (authData) {
          this.user = authService.getUserData();
        }
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  // view current user profile
  viewProfile() {
    this.nav.push(UserPage, {
      user: this.user
    });
  }

  // logout
  logout() {
    this.authService.logout().then(() => {
      this.nav.setRoot(LoginPage);
    });
  }
}
