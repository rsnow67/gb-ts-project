import { flatRentSdkProvider, homyProvider } from './index.js';
import { renderBlock, renderToast } from './lib.js';
import { FavoritePlace } from './place.js';
import { allData } from './search-form.js';
import { BookParams } from './store/domain/book-params.js';
import { Place } from './store/domain/place.js';
import { Provider } from './store/domain/provider.js';
import { renderUserBlock } from './user.js';

export let warningTimerId: ReturnType<typeof setTimeout> = null;

export const renderSearchStubBlock = () => {
  renderBlock(
    'search-results-block',
    `
    <div class="before-results-block">
      <img src="img/start-search.png" />
      <p>Чтобы начать поиск, заполните форму и&nbsp;нажмите "Найти"</p>
    </div>
    `
  );
}

export const showSearchResult = () => {
  if (!allData) {
    renderEmptyOrErrorSearchBlock('Не найдено подходящих результатов.');
    return;
  }

  renderSearchResultsBlock();

  const select: HTMLSelectElement = document.querySelector('.search-results-filter select');

  select.addEventListener('change', () => {
    const options = select.options;
    const selectedIndex = select.selectedIndex;
    const sortType = options[selectedIndex].value;

    const sortedData = sortResultsList(sortType);
    const content = makeListContent(sortedData);
    renderPlacesList(content);
  });

  const options = select.options;
  const selectedIndex = select.selectedIndex;
  const sortType = options[selectedIndex].value;
  const sortedData = sortResultsList(sortType);
  const content = makeListContent(sortedData);
  renderPlacesList(content);

  const homyBookButtons = document.querySelectorAll('.homy .book-button');
  const sdkBookButtons = document.querySelectorAll('.flat-rent-sdk .book-button');

  if (homyBookButtons) {
    addBookButtonsListeners(homyBookButtons, homyProvider);
  }

  if (sdkBookButtons) {
    addBookButtonsListeners(sdkBookButtons, flatRentSdkProvider);
  }

  addtoggleFavoriteListeners();
  warningTimerId = setTimeout(showWarningMessage, 300000);
}

const renderEmptyOrErrorSearchBlock = (reasonMessage: string): void => {
  renderBlock(
    'search-results-block',
    `
    <div class="no-results-block">
      <img src="img/no-results.png" />
      <p>${reasonMessage}</p>
    </div>
    `
  );
}

const renderSearchResultsBlock = () => {
  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select>
                <option selected value="price - low to high">Сначала дешёвые</option>
                <option value="price - high to low">Сначала дорогие</option>
                <option value="remoteness - low to high">Сначала ближе</option>
            </select>
        </div>
    </div>
    <div id='search-results'></div>
    `
  );
}

const sortResultsList = (type: string): Place[] => {
  if (!allData) {
    return;
  }

  if (type === 'price - low to high') {
    return allData.sort(sortAscendingPrice);
  }

  if (type === 'price - high to low') {
    return allData.sort(sortDescendingPrice);
  }

  if (type === 'remoteness - low to high') {
    return allData.sort(sortAscendingRemoteness);
  }
}

const sortAscendingPrice = (a: Place, b: Place): number => {
  return a.price - b.price;
}

const sortDescendingPrice = (a: Place, b: Place): number => {
  return b.price - a.price;
}

const sortAscendingRemoteness = (a: Place, b: Place): number => {
  return a.remoteness - b.remoteness;
}

const makeListContent = (places: Place[]): string => {
  const items = places.map((place) => {
    const active = isPlaceFavorite(place) ? 'active' : '';

    return (
      `
      <li class="search-results__item result ${place.provider}" data-id="${place.originalId}">
        <div class="result-container">
          <div class="result-img-container">
            <div class="favorites ${active}" data-id="${place.id}" data-original-id="${place.originalId}" data-name="${place.name}" data-image="${place.image}"></div>
            <img class="result-img" src="${place.image}" alt="${place.name} hotel" width="225" height="225">
          </div>	
          <div class="result-info">
            <div class="result-info--header">
              <p>${place.name}</p>
              <p class="price">${place.price}&#8381;</p>
            </div>
            <div class="result-info--map"><i class="map-icon"></i> ${place.remoteness} км от вас</div>
            <div class="result-info--descr">${place.description}</div>
            <div class="result-info--footer">
              <div>
                <button class="book-button" type="button" data-id="${place.originalId}">Забронировать</button>
              </div>
            </div>
          </div>
        </div>
      </li>`);
  });

  return `
  <ul class="search-results__list">
    ${items.join('')}
  </ul>
    `;
}

const isPlaceFavorite = (place: Place): boolean => {
  const localStorageItem = localStorage.getItem('favoriteItems');

  if (localStorageItem) {
    const favoriteItems: unknown = JSON.parse(localStorageItem);

    if (Array.isArray(favoriteItems)) {
      const favoriteItem = favoriteItems.some((item) => item.id === place.id);

      return favoriteItem;
    }
  } else {
    return false;
  }
}

const renderPlacesList = (listContent: string) => {
  renderBlock('search-results', listContent);
}

const addBookButtonsListeners = (
  buttons: NodeListOf<Element>,
  provider: Provider
): void => {
  const checkInDate = new Date(
    (<HTMLInputElement>document.getElementById('check-in-date')).value
  );
  const checkOutDate = new Date(
    (<HTMLInputElement>document.getElementById('check-out-date')).value
  );

  buttons.forEach((button: HTMLButtonElement) => {
    button.addEventListener('click', () => {
      const bookParams: BookParams = {
        placeId: button.dataset.id,
        checkInDate,
        checkOutDate
      }

      provider.book(bookParams);
    });
  });
}

const addtoggleFavoriteListeners = (): void => {
  const addToFavoritesButtons = document.querySelectorAll('.favorites');

  addToFavoritesButtons.forEach((button: HTMLButtonElement) => {
    button.addEventListener('click', toggleFavorite);
  });
}

const showWarningMessage = (): void => {
  const bookButtons = document.querySelectorAll('.book-button');

  disableButtons(bookButtons);
  renderToast(
    { text: 'Данные устарели. Обновите результаты поиска', type: 'error' },
    { name: 'ОК!', handler: () => console.log('Кнопки бронирования отключены.') }
  );
}

const disableButtons = (buttons: NodeListOf<Element>): void => {
  buttons.forEach((button: HTMLButtonElement) => {
    button.disabled = true;
  })
}

const toggleFavorite = (e: Event): void => {
  if (!(e.currentTarget instanceof HTMLDivElement)) {
    return;
  }

  const id = e.currentTarget.dataset.id;
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
      const favoriteItem = favoriteItems.find((item) => item.id === currentPlace.id);

      if (favoriteItem) {
        removeFromFavorites(currentPlace, favoriteItems);
      } else {
        addToFavorites(currentPlace, favoriteItems);
      }
    }
  } else {
    addToFavorites(currentPlace, []);
  }

  renderUserBlock();
}

const removeFromFavorites = (
  currentPlace: FavoritePlace,
  favoriteItems: FavoritePlace[]
): void => {
  const element = document.querySelector(`[data-id='${currentPlace.id}']`);
  element.classList.remove('active');

  const indexOfItem = favoriteItems.findIndex((item) => item.id === currentPlace.id);
  favoriteItems.splice(indexOfItem, 1);

  if (favoriteItems.length) {
    localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
  } else {
    localStorage.removeItem('favoriteItems');
  }
}

const addToFavorites = (
  currentPlace: FavoritePlace,
  favoriteItems: FavoritePlace[]
): void => {
  const element = document.querySelector(`[data-id='${currentPlace.id}']`);
  element.classList.add('active');

  favoriteItems.push(currentPlace);
  localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
}
