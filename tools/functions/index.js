const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require("stripe")(
    "sk_test_xIqzyztu8EtmErAFLRtRdcAf" // update your secret key here
);

const TRIP_STATUS_GOING = 'going';
const TRIP_STATUS_FINISHED = 'finished';
const PAYMENT_METHOD_CARD = 'card';

// init app
admin.initializeApp(functions.config().firebase);

// calculate driver's rating
exports.calculateRating = functions.database.ref('/trips/{tripId}').onWrite(function (event) {
  // Exit when the data is deleted.
  if (!event.data.exists()) {
    return;
  }

  // Grab the current value of what was written to the Realtime Database
  const original = event.data.val();

  // validate data
  if (!original.rating) {
    return;
  }

  admin.database().ref('/trips').orderByChild('driverId').equalTo(original.driverId).once('value', function (snap) {
    var stars = 0;
    var count = 0;

    snap.forEach(function (trip) {
      if (trip.val().rating) {
        stars += parseInt(trip.val().rating);
        count++
      }
    });

    // calculate avg
    var rating = stars / count;
    admin.database().ref('/drivers/' + original.driverId).update({
      rating: rating.toFixed(1)
    });
  });
});

// calculate driver report
exports.makeReport = functions.database.ref('/trips/{tripId}').onWrite(function (event) {
  // Exit when the data is deleted.
  if (!event.data.exists()) {
    return;
  }

  // Grab the current value of what was written to the Realtime Database
  const original = event.data.val();

  // get old status
  const oldStatus = event.data.child('status').previous.val();

  if ((original.status == TRIP_STATUS_FINISHED) && (oldStatus == TRIP_STATUS_GOING)) {
    var date = new Date();
    var fee = parseFloat(original.fee);

    // total sale
    admin.database().ref('reports/' + original.driverId + '/total').once('value').then(function (snapshot) {
      var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
      admin.database().ref('reports/' + original.driverId + '/total').set(parseFloat(snapshotVal) + fee);
    });

    // by year
    var yearPath = 'reports/' + original.driverId + '/' + date.getFullYear();
    admin.database().ref(yearPath + '/total').once('value').then(function (snapshot) {
      var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
      admin.database().ref(yearPath + '/total').set(parseFloat(snapshotVal) + fee);
    });

    // by month
    var monthPath = yearPath + '/' + (date.getMonth() + 1);
    admin.database().ref(monthPath + '/total').once('value').then(function (snapshot) {
      var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
      admin.database().ref(monthPath + '/total').set(parseFloat(snapshotVal) + fee);
    });

    // by date
    var datePath = monthPath + '/' + date.getDate();
    admin.database().ref(datePath + '/total').once('value').then(function (snapshot) {
      var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
      admin.database().ref(datePath + '/total').set(parseFloat(snapshotVal) + fee);
    });

    // process payment
    if (original.paymentMethod == PAYMENT_METHOD_CARD) {
      // update driver balance
      admin.database().ref('drivers/' + original.driverId + '/balance').once('value').then(function (snapshot) {
        var snapshotVal = snapshot.val() ? parseFloat(snapshot.val()) : 0;
        admin.database().ref('drivers/' + original.driverId + '/balance').set(parseFloat(snapshotVal) + fee);
      });

      // format currency
      if (original.currency == '$') {
        const currency = 'usd';
        admin.database().ref('passengers/' + original.passengerId + '/card').once('value').then(function (snapshot) {
          stripe.charges.create({
            amount: fee,
            currency: currency,
            source: snapshot.val(),
            description: "Charge for tripId: " + event.params.tripId
          }, {
            idempotency_key: event.params.tripId
          }, function (err, charge) {
            console.error(err);
            console.log(charge);
          });
        });
      } else {
        console.log('Currency ' + original.currency + ' is not supported');
      }
    }
  }
});