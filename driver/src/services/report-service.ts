import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database/database";
import { AuthService } from "./auth-service";

@Injectable()
export class ReportService {

  constructor(public db: AngularFireDatabase, public authService: AuthService) {
  }

  getAll() {
    let user = this.authService.getUserData();
    return this.db.object('reports/' + user.uid);
  }
}