export function getUserData(key: string): object | Error {
  const item = localStorage.getItem(key);

  if (item === null) {
    return new Error(`Айтем с ключом "${key}" не существует.`);
  }

  const value: unknown = JSON.parse(item);

  if (typeof value === 'object' && 'userName' in value && 'avatarUrl' in value) {
    return value;
  } else {
    return new Error('Данные по этому ключу не соответствуют UserData.');
  }
}

export function getFavoritesAmount(key: string): number {
  const localStorageItem = localStorage.getItem(key);

  if (localStorageItem === null) {
    return;
  }

  const data: unknown = JSON.parse(localStorageItem);

  if (Array.isArray(data)) {
    return data.length;
  }

  return;
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
