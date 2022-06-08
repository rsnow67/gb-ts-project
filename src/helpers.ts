import { SearchFormData } from './search-form-data.js';
import { searchCallback } from './search-callback.js'
import { renderEmptyOrErrorSearchBlock, makeListContent, renderSearchResultsBlock } from './search-results.js';
import { toggleFavoriteItem } from './search-form.js';

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

export const showSearchResult: searchCallback = (error, result): void => {
  if (error == null && result != null) {
    renderSearchResultsBlock(makeListContent(result));

    const buttons = document.querySelectorAll('.favorites');
    buttons.forEach((button) => {
      button.addEventListener('click', toggleFavoriteItem);
    });
  } else {
    renderEmptyOrErrorSearchBlock(error);
  }
}

export async function search(data: SearchFormData, callback: searchCallback) {
  const buttons = document.querySelectorAll('.favorites');
  buttons.forEach((button) => {
    button.removeEventListener('click', toggleFavoriteItem);
  });

  let url = 'http://localhost:3030/places?' +
    `checkInDate=${dateToUnixStamp(data.checkInDate)}&` +
    `checkOutDate=${dateToUnixStamp(data.checkOutDate)}&` +
    'coordinates=59.9386,30.3141'

  if (data.maxPrice != null) {
    url += `&maxPrice=${data.maxPrice}`;
  }

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (response.status === 200) {
      if (result.length) {
        callback(null, result);
      } else {
        callback('Ничего не найдено. Попробуйте изменить параметры поиска.');
      }
    } else {
      callback(result.message);
    }
  } catch (error) {
    console.error(error);
  }
}

export function dateToUnixStamp(date: Date) {
  return date.getTime() / 1000
}
