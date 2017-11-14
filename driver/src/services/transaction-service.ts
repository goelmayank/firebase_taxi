import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database/database";
import { AuthService } from "./auth-service";
import { TRANSACTION_TYPE_WITHDRAW } from "./constants";

@Injectable()
export class TransactionService {
  constructor(public db: AngularFireDatabase, public authService: AuthService) {
  }

  getTransactions() {
    let user = this.authService.getUserData();
    return this.db.list('transactions/' + user.uid);
  }

  widthDraw(amount: number, balance: number) {
    let user = this.authService.getUserData();
    return this.db.list('transactions/' + user.uid).push({
      amount: amount,
      createdAt: Date.now(),
      type: TRANSACTION_TYPE_WITHDRAW
    }).then(() => {
      this.db.object('drivers/' + user.uid).update({
        balance: balance - amount
      });
    });
  }
}
