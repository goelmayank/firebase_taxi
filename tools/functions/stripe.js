/**
 * this is test code for Stripe payment
 * Run it: node stripe.js
 */
var stripe = require("stripe")(
    "sk_test_xIqzyztu8EtmErAFLRtRdcAf"
);

stripe.charges.create({
  amount: 2000,
  currency: "usd",
  source: "tok_1B2cJNJxhUdrzA6Z7Pi5wP8K", // obtained with Stripe.js
  description: "Charge for Firebase taxi"
}, {
  idempotency_key: new Date()
}, function (err, charge) {
  console.log(err, charge);
});