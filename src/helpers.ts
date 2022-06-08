import { SearchFormData } from './search-form-data.js';
import { Place } from './place.js';
import { CallbackRandom } from './callback-random.js'

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

export function getFavoritesAmount(key: string): number | Error {
  const item: unknown = localStorage.getItem(key);

  if (item === null) {
    return new Error(`Айтем с ключом "${key}" не существует.`);
  }

  const value = Number(item);

  if (isNaN(value)) {
    return new Error('Значение по этому ключу не является числом.');
    
  }

  return value;
}

export function search(data: SearchFormData, callback: CallbackRandom): void {
  console.log(data);
  callback(new Error('ошибочка'), [{}]);
}

export const showRandom: CallbackRandom = (error: Error, places: Place[]): void => {
  setTimeout(() => {
    if (Math.random() < 0.5) {
      console.log(error);
    } else {
      console.log(places);
    }
  }, 3000);
}
