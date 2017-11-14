import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { AuthService } from "../../services/auth-service";
import * as firebase from 'firebase';
import { SettingService } from "../../services/setting-service";
import { HomePage } from "../home/home";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {
  user = {
    name: '',
    photoURL: '',
    phoneNumber: '',
    plate: '',
    brand: '',
    type: '',
  };
  types: Array<any> = [];

  constructor(public nav: NavController, public authService: AuthService, public navParams: NavParams,
              public toastCtrl: ToastController, public loadingCtrl: LoadingController,
              public settingService: SettingService, public alertCtrl: AlertController) {
    let user = navParams.get('user');

    // list of vehicle types
    this.settingService.getVehicleType().take(1).subscribe(snapshot => {''
      if (snapshot.$value === null) {
        this.settingService.getDefaultVehicleType().take(1).subscribe(snapshot => {
          this.types = Object.keys(snapshot);
        })
      } else {
        this.types = Object.keys(snapshot);
      }
    });

    this.authService.getUser(user.uid).take(1).subscribe(snapshot => {
      snapshot.uid = snapshot.$key;
      this.user = snapshot;
    });
  }

  // save user info
  save() {
    if (!this.user.name) {
      return this.showAlert('Please enter name!')
    }
    if (!this.user.phoneNumber) {
      return this.showAlert('Please enter phone number!')
    }
    if (!this.user.plate) {
      return this.showAlert('Please enter plate!')
    }
    if (!this.user.brand) {
      return this.showAlert('Please enter brand!')
    }
    if (!this.user.type) {
      return this.showAlert('Please choose type!')
    }

    this.authService.updateUserProfile(this.user);

    this.nav.setRoot(HomePage);
    let toast = this.toastCtrl.create({
      message: 'Your profile has been updated',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  // choose file for upload
  chooseFile() {
    document.getElementById('avatar').click();
  }

  // upload thumb for item
  upload() {
    // Create a root reference
    let storageRef = firebase.storage().ref();
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    for (let selectedFile of [(<HTMLInputElement>document.getElementById('avatar')).files[0]]) {
      let path = '/users/' + Date.now() + `${selectedFile.name}`;
      let iRef = storageRef.child(path);
      iRef.put(selectedFile).then((snapshot) => {
        loading.dismiss();
        this.user.photoURL = snapshot.downloadURL;
      });
    }
  }

  // show alert with message
  showAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
}