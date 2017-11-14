export class Place {
  private lat: number;
  private lng: number;
  private vicinity: string;

  constructor(vicinity, lat, lng) {
    this.lat = lat;
    this.lng = lng;
    this.vicinity = vicinity;
  }

  // get place object with formatted data
  getFormatted() {
    return {
      location: {
        lat: this.lat,
        lng: this.lng
      },
      vicinity: this.vicinity
    }
  }
}