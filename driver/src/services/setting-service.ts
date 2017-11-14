import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from "@ionic/storage";
import { PlaceService } from "./place-service";

@Injectable()
export class SettingService {

  constructor(public db: AngularFireDatabase, public storage: Storage, public placeService: PlaceService) {

  }

  getVehicleType() {
    return this.db.object('master_settings/prices/' + this.placeService.getLocality() + '/vehicles');
  }

  getDefaultVehicleType() {
    return this.db.object('master_settings/prices/default/vehicles');
  }
}
