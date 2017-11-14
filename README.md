##How to setup Firebase food order app


###System requirements
 `npm` version from 5.5.1 and `node` from 8.5.0
Run these command to check your version:
```
npm -v
node -v
```
The easiest way to update is to install the [latest version of Node.js](https://nodejs.org/en/).
You can also update `npm` by following [these instructions](https://docs.npmjs.com/getting-started/installing-node#updating-npm). 


 `ionic` version from 3.7.0. Run this command to check your version:
```
ionic -v
```
Update your ionic by run these comands:
```
npm uninstall -g ionic
npm install -g ionic
```


###Setting up the apps
Please follow these step

1. Download .zip file from Gumroad or Sellfy and unzip.

2. Go to `passenger` folder  

3. Run ```npm install``` to install libraries

4. Run ```ionic serve```, your browser will automatically open the customer app

5. Go to `driver` folder  

6. Run ```npm install``` to install libraries

7. Run ```ionic serve```, your browser will automatically open the admin app

If you want to run both of these apps at the same time, please specific the port like this:
```ionic serve --port=9000```

These apps require location permission to run, so please allow location permission.

###Demo account
Driver: driver@gmail.com / demodemo
Customer: demo@gmail.com / demodemo

###Social login setup
1. Go to Firebase authentication methods https://console.firebase.google.com/project/your-project/authentication/providers
2. Enable Social provider. Eg: Facebook, Google
3. Enter App key and App secret and save
4. Now you can login with social accounts


###Changing the style
Color `variables` are defined at line 23 of `src/theme/variables.scss`

You can modify this file to change app's color. 

Common styles are defined at `src/app/app.scss`. Modify this file to change common style of the app.

To change each page's style. Please write your style into `src/pages/{page_name}/{page_name}.scss`

### Config Firebase DB 
To use your own Firebase DB, change Firebase config on src/app.module.ts

```
export const firebaseConfig = {
  apiKey: "AIzaSyBLp8awgJKxxFXdFv1lDHH5EDVDmMa3huI",
  authDomain: "fir-taxi-30f13.firebaseapp.com",
  databaseURL: "https://fir-taxi-30f13.firebaseio.com",
  projectId: "fir-taxi-30f13",
  storageBucket: "fir-taxi-30f13.appspot.com",
  messagingSenderId: "754076567028"
};
```

Import the file DB/rules.json to Firebase rules. This file contains DB security rules to protect your DB.

Import master data from DB/sample_data.json to Firebase DB

### Setup firebase functions
[Cloud Functions](https://firebase.google.com/docs/functions/) for Firebase lets you automatically run backend code in response to events triggered by Firebase features and HTTPS requests. Your code is stored in Google’s cloud and runs in a managed environment. There's no need to manage and scale your own servers.
Go to functions directory and run
```
npm install
```

Change DB name in tools/.firebaserc

```
{
  "projects": {
    "default": "your-db-name"
  }
}

```

Login to your firebase

```
firebase login
```

Deploy your changes
```
firebase deploy --only functions
```

### Map APIs
These apps use Google Map API for javascript, so please read about map APIs before your make any modification. 
You should understand what is `locality`: [enter link description here](https://developers.google.com/maps/documentation/geocoding/intro)

### Stripe payment
These app supports payment by card via Stripe. 
Test card info:
 - Card number: 4242424242424242
 - Expire date: 08/20
 - CVV: 1111
 Get your Publishable key & Secret key from [here](https://dashboard.stripe.com/account/apikeys)

Update publishable key to passenger app in the file `passenger/src/index.html`

```
<script type="text/javascript">
  Stripe.setPublishableKey('pk_test_YFY5rwB7vioNoC6FLD3o8hPe');
</script>

```

Update secret key to Firebase function `tools/functions/index.js`

```
const stripe = require("stripe")(
    "sk_test_xIqzyztu8EtmErAFLRtRdcAf" // update your secret key here
);
```

Deploy your changes
```
firebase deploy --only functions
```

**Note:** Firebase requires [Flame plan](https://firebase.google.com/pricing/) to allow outbound networking. So you can not use Stripe payment if you are using Free plan.

### How do these app work?
**Passenger**

Only show active vehicles on the maps within 5km

The fare is calculated base on vehicle type price * distance between origin & destination. The distance is calculated by Google Map direction. Example: http://maps.google.com/maps/api/directions/json?origin=21.0158299,105.9496894&destination=21.0029848,105.8209625    

Make deal to drivers, one by one. The list of drivers is sorted by driver rating & distance. If the driver declined or timeout, the deal will pass to next drivers on the lists.

If no more drivers on the drivers list, passenger needs to comeback home screen and book again.

**Driver**

The driver app update current to Firebase every 5 seconds.

When passenger puts a new deal, the job modal will show. The driver has 20 seconds to accept or decline it.

The driver needs to touch pick-up button when pick up the passenger and also drop-off button. After that, the price will be shown on the driver's app


###Adding a vehicle type

Go to `passenger/src/assets/img/icon`
Add vehicle front view icon. The icon format should be SVG. Example: sedan.svg
Add vehicle top view icon with angles:
    + left
    + top left
    + top
    + top right
    + right
    + bottom right
    + bottom
    + bottom left
The icons format should be png. Example: sedan_bottom.png

Add vehicle type to master_settings on Firebase console:

```
{
  "master_settings" : {
    "prices" : {
      "Your locality" : {
        "currency" : "$",
        "vehicles" : {
          "new_type" : {
            "enable" : true,
            "icon" : "sedan",
            "name" : "New vehicle",
            "price" : 0.3
          }
        }
      },
      "default" : {
        "currency" : "$",
        "vehicles" : {
          "new_type" : {
            "enable" : true,
            "icon" : "sedan",
            "name" : "New vehicle",
            "price" : 0.3
          }
        }
      }
    }
  }
}
```

###Adding a new page

To create a page you can use the following command:
```
# ionic g page <PageName>
ionic g page myPage

√ Create app/pages/my-page/my-page.html
√ Create app/pages/my-page/my-page.ts
√ Create app/pages/my-page/my-page.scss
```
Read more about ionic generate [here](https://ionicframework.com/docs/v2/cli/generate/).

### Build APK file
Make sure that you installed Android SDK first.
Run this command to build .apk file
```
ionic cordova build android --prod
```
Or run it in your device with:
```
ionic cordova run android --prod
```


###About me
My name is Dao Duy Thanh. I'm a full stack developer (PHP + frontend).

View my apps at: [http://market.ionic.io/user/231798](http://market.ionic.io/user/231798)

View my Youtube channel at: [https://www.youtube.com/channel/UCgqx9-AWwoj5Z3i6U3slQ_w](https://www.youtube.com/channel/UCgqx9-AWwoj5Z3i6U3slQ_w)

Contact me by email: **successdt@hotmail.com**

###References

 - [Ionic 2 documentation](https://ionicframework.com/docs/v2/)
 - [Angular 2 guide](https://angular.io/docs/ts/latest/guide/)
 - [Nodejs instructions](https://docs.npmjs.com/getting-started/installing-node#updating-npm)
 - [Firebase docs](https://firebase.google.com/docs/web/setup)
 - [Geocoding](https://developers.google.com/maps/documentation/geocoding/intro)
 - [Stripe Js](https://stripe.com/docs/stripe.js?)
 - [Stripe Node](https://stripe.com/docs/api/node#intro)# firebase_taxi
