import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database/database";
import { Place } from "./place";
import { AuthService } from "./auth-service";

@Injectable()
export class TripService {
  private id: any;
  private trips: any;
  private currency: string;
  private origin: any;
  private destination: any;
  private distance: number;
  private fee: number;
  private note: string;
  private paymentMethod: any = 'cash';
  private vehicle: any;
  // vehicle's icon
  private icon: any;
  private availableDrivers: Array<any> = [];

  constructor(public db: AngularFireDatabase, public authService: AuthService) {

  }

  getAll() {
    return this.trips;
  }

  setId(id) {
    return this.id = id;
  }

  getId() {
    return this.id;
  }

  setCurrency(currency) {
    return this.currency = currency;
  }

  getCurrency() {
    return this.currency;
  }

  setOrigin(vicinity, lat, lng) {
    let place = new Place(vicinity, lat, lng);
    return this.origin = place.getFormatted();
  }

  getOrigin() {
    return this.origin;
  }

  setDestination(vicinity, lat, lng) {
    let place = new Place(vicinity, lat, lng);
    return this.destination = place.getFormatted();
  }

  getDestination() {
    return this.destination
  }

  setDistance(distance) {
    return this.distance = distance;
  }

  getDistance() {
    return this.distance;
  }

  setFee(fee) {
    return this.fee = fee;
  }

  getFee() {
    return this.fee;
  }

  setNote(note) {
    return this.note = note;
  }

  getNote() {
    return this.note;
  }

  setPaymentMethod(method) {
    return this.paymentMethod = method;
  }

  getPaymentMethod() {
    return this.paymentMethod;
  }

  setVehicle(vehicle) {
    return this.vehicle = vehicle;
  }

  getVehicle() {
    return this.vehicle;
  }

  setIcon(icon) {
    return this.icon = icon;
  }

  getIcon() {
    return this.icon;
  }

  setAvailableDrivers(vehicles) {
    console.log(vehicles);
    this.availableDrivers = vehicles;
  }

  getAvailableDrivers() {
    return this.availableDrivers;
  }

  getTrip(id) {
    return this.db.object('trips/' + id);
  }

  getTrips() {
    let user = this.authService.getUserData();
    console.log(user);
    return this.db.list('trips', {
      query: {
        orderByChild: 'passengerId',
        equalTo: user.uid
      }
    });
  }

  rateTrip(tripId, stars) {
    return this.db.object('trips/' + tripId).update({
      rating: stars
    });
  }
}