import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/take'
import { DEFAULT_AVATAR } from "./constants";

@Injectable()
export class AuthService {
  user: any;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, public storage: Storage) {

  }

  // get current user data from firebase
  getUserData() {
    return this.afAuth.auth.currentUser;
  }

  // get driver by id
  getUser(id) {
    return this.db.object('drivers/' + id);
  }

  // login with email & password
  login(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  // login with facebook
  loginWithFacebook() {
    return Observable.create(observer => {
      this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(result => {

        this.createUserIfNotExist(result.user);
        observer.next();
      }).catch((error: any) => {
        if (error) {
          observer.error(error);
        }
      });
    });
  }

  // login with google
  loginWithGoogle() {
    return Observable.create(observer => {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(result => {

        this.createUserIfNotExist(result.user);
        observer.next();
      }).catch((error: any) => {
        if (error) {
          observer.error(error);
        }
      });
    });
  }

  // logout from firebase
  logout() {
    return this.afAuth.auth.signOut();
  }

  // register new account
  register(email, password, name) {
    return Observable.create(observer => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((authData: any) => {
        authData.name = name;

        // update driver object
        this.updateUserProfile(authData);
        this.setupInitData(authData.uid);
        observer.next();
      }).catch((error: any) => {
        if (error) {
          observer.error(error);
        }
      });
    });
  }

  // update user display name and photo
  updateUserProfile(user) {
    let name = user.name ? user.name : user.email;
    let photoUrl = user.photoURL ? user.photoURL : DEFAULT_AVATAR;

    this.getUserData().updateProfile({
      displayName: name,
      photoURL: photoUrl
    });

    // create or update passenger
    this.db.object('drivers/' + user.uid).update({
      name: name,
      photoURL: photoUrl,
      email: user.email,
      phoneNumber: user.phoneNumber ? user.phoneNumber : '',
      plate: user.plate ? user.plate : '',
      brand: user.brand ? user.brand : '',
      type: user.type ? user.type : '',
    })
  }

  // setup init data for user
  setupInitData(driverId) {
    this.db.object('drivers/' + driverId).update({
      balance: 10,
      rating: 4,
      refCode: driverId.substring(1, 4)
    });
  }

  // create new user if not exist
  createUserIfNotExist(user) {
    // check if user does not exist
    this.getUser(user.uid).take(1).subscribe(snapshot => {
      if (snapshot.$value === null) {
        // update passenger object
        this.updateUserProfile(user);
      }
    });
  }
}
