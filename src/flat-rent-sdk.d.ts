export const database: Flat[];
export const backendPort: number;
export const localStorageKey: string;

export function cloneDate(date: Date): Date;
export function addDays(date: Date, days: number): Date;

export interface Flat {
  id: string,
  title: string,
  details: string,
  photos: string[],
  coordinates: number[],
  bookedDates: number[],
  price: number,

}

export interface SearchParameters {
  city: string,
  checkInDate: Date,
  checkOutdate: Date,
  priceLimit?: number,
}

export class FlatRentSdk {
  get(id: string): Promise<Flat | null>;
  search(parameters: SearchParameters): Flat[];
  book(flatId: number, checkInDate: Date, checkOutDate: Date): number;
  private _assertDatesAreCorrect(checkInDate: Date, checkOutDate: Date): void;
  private _resetTime(date: Date): void;
  private _calculateDifferenceInDays(startDate: Date, endDate: Date): number;
  private _generateDateRange(from: Date, to: Date): Date[];
  private _generateTransactionId(): number;
  private _areAllDatesAvailable(flat: Flat, dateRange: Date[]): boolean;
  private _formatFlatObject(flat: Flat, nightNumber?: number): Flat;
  private _readDatabase(): Flat[];
  private _writeDatabase(database: Flat[]): void;
  private _syncDatabase(database: Flat[]): void;
}
