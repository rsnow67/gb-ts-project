import { Place } from './place.js';

export interface searchCallback {
  (error?: string, places?: Place[]): void
}
