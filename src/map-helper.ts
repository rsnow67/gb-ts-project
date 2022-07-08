import { MapPoint } from './map-point.js';

export abstract class MapHelper {
  private static radiusOfTheEarthInKm = 6371;

  public static getDistanceFromLatLngInKm(
    startPoint: MapPoint | null,
    endPoint: MapPoint | null
  ): number | null {
    if (!startPoint || !endPoint) {
      return null;
    }

    const lat1 = startPoint.lat;
    const lng1 = startPoint.lng;
    const lat2 = endPoint.lat;
    const lng2 = endPoint.lng;
    const latDistance = this.deg2rad(lat2 - lat1);
    const lngDistance = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInKm = MapHelper.radiusOfTheEarthInKm * c;
    return Number(distanceInKm.toFixed(1));
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}
