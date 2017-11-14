import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction-service';
import { DriverService } from "../../services/driver-service";

/*
 Generated class for the WalletPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html'
})
export class WalletPage {
  // list of transactions
  public records: any;
  public driver: any;

  constructor(public nav: NavController, public transactionService: TransactionService,
              public driverService: DriverService, public alertCtrl: AlertController, public toastCtrl: ToastController) {
    // get transactions from service
    transactionService.getTransactions().subscribe(snapshot => {
      this.records = snapshot.reverse();
    });
    driverService.getDriver().subscribe(snapshot => {
      this.driver = snapshot;
    });

  }

  withdraw() {

    let prompt = this.alertCtrl.create({
      title: 'Make a withdraw',
      message: "",
      inputs: [
        {
          name: 'amount',
          placeholder: 'Amount'
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
          text: 'Submit',
          handler: data => {

            if (data.amount > this.driver.balance) {
              let alert = this.alertCtrl.create({
                title: 'Error',
                message: 'Your balance is not enough',
                buttons: ['OK']
              });
              return alert.present();
            }

            this.transactionService.widthDraw(data.amount, this.driver.balance).then(() => {
              let toast = this.toastCtrl.create({
                message: 'Withdraw is successfully',
                duration: 3000,
                position: 'middle'
              });
              toast.present();
            });
          }
        }
      ]
    });

    prompt.present();
  }
}