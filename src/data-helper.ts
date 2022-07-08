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
