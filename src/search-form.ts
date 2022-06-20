import { 
  renderBlock, 
  renderToast 
} from './lib.js';
import { dateToUnixStamp } from './helpers.js';
import { SearchFormData } from './search-form-data.js';
import { searchCallback } from './search-callback.js'
import { FavoritePlace } from './types.js';
import { renderUserBlock } from './user.js';
import { 
  bookPlace,
  makeListContent, 
  renderEmptyOrErrorSearchBlock, 
  renderSearchResultsBlock 
} from './search-results.js';

export let warningTimerId: ReturnType<typeof setTimeout> = null;

export function renderSearchFormBlock(
  checkInDate?: Date,
  checkOutDate?: Date
) {
  const today = new Date();
  const lastDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  let checkInDefaultDate = null;
  let checkOutDefaultDate = null;

  if (checkInDate == null && checkOutDate == null) {
    checkInDefaultDate = new Date();
    checkOutDefaultDate = new Date();
    checkInDefaultDate.setDate(today.getDate() + 1);
    checkOutDefaultDate.setDate(checkInDefaultDate.getDate() + 2);
  } else if (checkOutDate == null) {
    checkOutDefaultDate = new Date();
    checkOutDefaultDate.setDate(checkInDate.getDate() + 2);
  }

  const min = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    .toISOString().split('T')[0];
  const max = new Date(lastDayOfNextMonth.getTime() - (lastDayOfNextMonth.getTimezoneOffset() * 60000))
    .toISOString().split('T')[0];
  const checkInValue = checkInDate ?
    new Date(checkInDate.getTime() - (checkInDate.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0]
    :
    new Date(checkInDefaultDate.getTime() - (checkInDefaultDate.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0];
  const checkOutValue = checkOutDate ?
    new Date(checkOutDate.getTime() - (checkOutDate.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0]
    :
    new Date(checkOutDefaultDate.getTime() - (checkOutDefaultDate.getTimezoneOffset() * 60000))
      .toISOString().split('T')[0];

  renderBlock(
    'search-form-block',
    `
    <form>
      <fieldset class="search-filedset">
        <div class="row">
          <div>
            <label for="city">Город</label>
            <input id="city" type="text" disabled value="Санкт-Петербург" />
            <input type="hidden" disabled value="59.9386,30.3141" />
          </div>
          <!--<div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>--!>
        </div>
        <div class="row">
          <div>
            <label for="check-in-date">Дата заезда</label>
            <input id="check-in-date" type="date" value="${checkInValue}" min="${min}" max="${max}" name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value="${checkOutValue}" min="${min}" max="${max}" name="checkout" />
          </div>
          <div>
            <label for="max-price">Макс. цена суток</label>
            <input id="max-price" type="text" value="" name="price" class="max-price" />
          </div>
          <div>
            <div><button>Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  );
}

export function handleSubmit(e: Event) {
  e.preventDefault();

  const sendData: SearchFormData = {
    city: (<HTMLInputElement>document.getElementById('city')).value,
    checkInDate: new Date((<HTMLInputElement>document.getElementById('check-in-date')).value),
    checkOutDate: new Date((<HTMLInputElement>document.getElementById('check-out-date')).value),
    maxPrice: Number((<HTMLInputElement>document.getElementById('max-price')).value)
  }

  search(sendData, showSearchResult);
}

export async function search(data: SearchFormData, callback: searchCallback): Promise<void> {
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

export const showSearchResult: searchCallback = (error, result): void => {
  if (error == null && result != null) {
    removeListItemsListeners();
    renderSearchResultsBlock(makeListContent(result));
    addListItemsListeners();
    warningTimerId = setTimeout(showWarningMessage, 30000);
  } else {
    renderEmptyOrErrorSearchBlock(error);
  }
}

const addListItemsListeners = (): void => {
  const addToFavoritesButtons = document.querySelectorAll('.favorites');
  const bookButtons = document.querySelectorAll('.book-button');

  addToFavoritesButtons.forEach((button) => {
    button.addEventListener('click', toggleFavoriteItem);
  });
  bookButtons.forEach((button) => {
    button.addEventListener('click', bookPlace);
  });
} 

const removeListItemsListeners = (): void => {
  const addToFavoritesButtons = document.querySelectorAll('.favorites');
  const bookButtons = document.querySelectorAll('.book-button');

  addToFavoritesButtons.forEach((button) => {
    button.removeEventListener('click', toggleFavoriteItem);
  });
  bookButtons.forEach((button) => {
    button.removeEventListener('click', bookPlace);
  });
} 

const showWarningMessage = (): void => {
  const bookButtons = document.querySelectorAll('.book-button');

  disableButtons(bookButtons);
  renderToast(
    { text: 'Данные устарели. Обновите результаты поиска', type: 'error' },
    { name: 'ОК!', handler: () => console.log('Search again.') }
  );
}

const disableButtons = (buttons: NodeListOf<Element>): void => {
  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.disabled = true;
  })
}

export function toggleFavoriteItem(e: Event): void {
  if (!(e.currentTarget instanceof HTMLDivElement)) {
    return;
  }

  const id = Number(e.currentTarget.dataset.id);
  const name = e.currentTarget.dataset.name;
  const image = e.currentTarget.nextElementSibling.getAttribute('src');
  const currentPlace: FavoritePlace = {
    id,
    name,
    image
  }
  const localStorageItem = localStorage.getItem('favoriteItems');

  if (localStorageItem) {
    const favoriteItems: unknown = JSON.parse(localStorageItem);

    if (Array.isArray(favoriteItems)) {
      const favoriteItem = favoriteItems.find((item) => item.id === id);

      if (favoriteItem) {
        removeFavoriteItemFromStorage(favoriteItem, favoriteItems);
      } else {
        addFavoriteItemToStorage(currentPlace, favoriteItems);
      }
    }
  } else {
    localStorage.setItem('favoriteItems', JSON.stringify([currentPlace]));
  }

  renderUserBlock();
}

function removeFavoriteItemFromStorage(favoriteItem: FavoritePlace, favoriteItems: FavoritePlace[]): void {
  const indexOfItem = favoriteItems.indexOf(favoriteItem);
  favoriteItems.splice(indexOfItem, 1);

  if (favoriteItems.length) {
    localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
  } else {
    localStorage.removeItem('favoriteItems');
  }
}

function addFavoriteItemToStorage(currentPlace: FavoritePlace, favoriteItems: FavoritePlace[]): void {
  favoriteItems.push(currentPlace);
  localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
}
