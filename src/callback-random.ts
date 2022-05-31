import { Place } from './place.js';

export interface CallbackRandom {
  (error: Error, places: Place[]): void
}
