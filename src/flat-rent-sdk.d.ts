import { SearchFilter } from './store/domain/search-filter';
import { Flat } from './store/providers/flat-rent-sdk/response';

export const database: Flat[];
export const backendPort: number;
export const localStorageKey: string;

export function cloneDate(date: Date): Date;
export function addDays(date: Date, days: number): Date;

export class FlatRentSdk {
  get(id: string): Promise<Flat | null>;
  search(parameters: SearchFilter): Promise<Flat[] | Error>;
  book(flatId: string, checkInDate: Date, checkOutDate: Date): Promise<number | Error>;
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
