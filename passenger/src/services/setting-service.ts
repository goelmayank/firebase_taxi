import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from "@ionic/storage";

@Injectable()
export class SettingService {

  constructor(public db: AngularFireDatabase, public storage: Storage) {

  }

  getPrices() {
    return this.db.object('master_settings/prices');
  }
}
