import {Component} from '@angular/core';
import { NavController, ToastController, AlertController, LoadingController, NavParams } from 'ionic-angular';

import {AuthService} from '../../services/auth-service';
import { HomePage } from "../home/home";
declare var Stripe: any;
/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-card-setting',
  templateUrl: 'card-setting.html',
})
export class CardSettingPage {
  number: any;
  exp: any;
  cvv: any;

  constructor(public nav: NavController, public authService: AuthService, public toastCtrl: ToastController,
              public alertCtrl: AlertController, public loadingCtrl: LoadingController, public navParams: NavParams) {
    authService.getCardSetting().take(1).subscribe(snapshot => {
      this.number = snapshot.number;
      this.exp = snapshot.exp;
      this.cvv = snapshot.cvv;
    });
  }

  // save card settings
  save() {
    const exp = this.exp.split('/');
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    Stripe.card.createToken({
      number: this.number,
      exp_month: exp[0],
      exp_year: exp[1],
      cvc: this.cvv
    }, (status: number, response: any) => {
      loading.dismiss();
      // success
      if (status == 200) {
        // if nav from payment method selection
        if (this.navParams.get('back')) {
          this.nav.pop();
        } else {
          this.nav.setRoot(HomePage);
        }

        this.authService.updateCardSetting(this.number, this.exp, this.cvv, response.id);
        let toast = this.toastCtrl.create({
          message: 'Your card setting has been updated',
          duration: 3000,
          position: 'middle'
        });
        toast.present();
      } else {
        // error
        let alert = this.alertCtrl.create({
          title: 'Error',
          subTitle: response.error.message,
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }
}