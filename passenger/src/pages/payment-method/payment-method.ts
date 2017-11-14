import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AuthService } from "../../services/auth-service";
import { CardSettingPage } from "../card-setting/card-setting";
import { TripService } from "../../services/trip-service";

/*
 Generated class for the PaymentMethodPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-payment-method',
  templateUrl: 'payment-method.html'
})
export class PaymentMethodPage {
  carNumber: any = null;

  constructor(public nav: NavController, public authService: AuthService, public tripService: TripService,
              public loadingCtrl: LoadingController) {
    const loading = loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    authService.getCardSetting().take(1).subscribe(snapshot => {
      loading.dismiss();
      if (snapshot) {
        this.carNumber = snapshot.number;
      }
    });
  }

  // apply change method
  changeMethod(method) {
    this.tripService.setPaymentMethod(method);
    // go back
    this.nav.pop();
  }

  // add card
  addCard() {
    this.nav.push(CardSettingPage, {back: true});
  }
}
