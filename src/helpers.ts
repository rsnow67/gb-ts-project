export function getUserData(key: string): object | Error {
  const localStorageItem = localStorage.getItem(key);

  if (localStorageItem === null) {
    throw new Error(`Айтем с ключом "${key}" не существует.`);
  }

  const value: unknown = JSON.parse(localStorageItem);

  if (typeof value === 'object' && value !== null && 'userName' in value && 'avatarUrl' in value) {
    return value;
  }

  throw new Error('Данные по этому ключу не соответствуют UserData.');
}

export function getFavoritesAmount(key: string): number | null {
  const localStorageItem = localStorage.getItem(key);

  if (localStorageItem === null) {
    return null;
  }

  const data: unknown = JSON.parse(localStorageItem);

  if (Array.isArray(data)) {
    return data.length;
  }

  return null;
}
export abstract class DataHelper {
  public static cloneDate(date: Date): Date {
    return new Date(date.getTime());
  }

  public static addDays(date: Date, days: number): Date {
    const newDate = this.cloneDate(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
  }

  public static getLastDayOfNextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 2, 0)
  }

  public static dateToUnixStamp(date: Date) {
    const dateString = date.toDateString();

    return Date.parse(dateString) / 1000;
  }

  public static toLocalISOString(date: Date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  }
}

export abstract class MapHelper {
  private static radiusOfTheEarthInKm = 6371;

  public static getDistanceFromLatLngInKm(
    startPoint: number[],
    endPoint: number[]
  ): number {
    const lat1 = startPoint[0];
    const lng1 = startPoint[1];
    const lat2 = endPoint[0];
    const lng2 = endPoint[1];
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
