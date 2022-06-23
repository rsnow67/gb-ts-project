import { Flat } from './flat-rent-sdk.js';
import { Place, searchResult } from './place.js';

export interface searchCallback {
  (error?: Error, places?: searchResult): void
}
