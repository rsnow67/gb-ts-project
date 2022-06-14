import { Place } from './place.js';

export type FavoritePlace = Pick<Place, 'id' | 'name' | 'image'>;
export type ResponseStatus = 'success' | 'error';
