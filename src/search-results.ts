import { flatRentSdkProvider, homyProvider } from './index.js';
import { renderBlock, renderToast } from './lib.js';
import { FavoritePlace } from './favorite-place.js';
import { BookParams } from './store/domain/book-params.js';
import { Place } from './store/domain/place.js';
import { Provider } from './store/domain/provider.js';
import { renderUserBlock } from './user.js';

export let warningTimerId: ReturnType<typeof setTimeout>;

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

export const showSearchResult = (allData: Place[]) => {
  if (!allData.length) {
    renderEmptyOrErrorSearchBlock('Не найдено подходящих результатов.');
    return;
  }

  renderSearchResultsBlock();

  const select = document.querySelector('.search-results-filter select');

  if (!(select instanceof HTMLSelectElement)) {
    return;
  }

  select.addEventListener('change', () => {
    handleSelectSort(select, allData);
  });

  select.dispatchEvent(new Event('change'));

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

const handleSelectSort = (select: HTMLSelectElement, data: Place[]): void => {
  const options = select.options;
  const selectedIndex = select.selectedIndex;
  const sortType = options[selectedIndex]?.value || '';
  const sortedData = sortResultsList(data, sortType);

  if (!sortedData) {
    return;
  }

  const content = makeListContent(sortedData);
  renderPlacesList(content);
}

const sortResultsList = (array: Place[], type: string): Place[] | null => {
  switch (type) {
    case 'price - low to high':
      return array.sort(sortAscendingPrice);
    case 'price - high to low':
      return array.sort(sortDescendingPrice);
    case 'remoteness - low to high':
      return array.sort(sortAscendingRemoteness);
    default:
      return null;
  }
}

const sortAscendingPrice = (a: Place, b: Place): number => {
  return a.price - b.price;
}

const sortDescendingPrice = (a: Place, b: Place): number => {
  return b.price - a.price;
}

const sortAscendingRemoteness = (a: Place, b: Place): number => {
  if (a.remoteness && b.remoteness) {
    return a.remoteness - b.remoteness;
  } else if (a.remoteness) {
    return -1;
  } else {
    return 1;
  }
}

const makeListContent = (places: Place[]): string => {
  const items = places.map((place) => {
    const active = isPlaceFavorite(place) ? 'active' : '';
    const remotenessMessage = place.remoteness ?
      `${place.remoteness} км от вас` :
      'Расстояние неизвестно'

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
            <div class="result-info--map"><i class="map-icon"></i>${remotenessMessage}</div>
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
      const hasFavoriteItem = favoriteItems.some((item) => item.id === place.id);

      return hasFavoriteItem;
    }
  }

  return false;
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

  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    button.addEventListener('click', () => {
      const placeId = button.dataset['id'];

      if (placeId) {
        const bookParams: BookParams = {
          placeId,
          checkInDate,
          checkOutDate
        }

        provider.book(bookParams);
      }
    });
  });
}

const addtoggleFavoriteListeners = (): void => {
  const addToFavoritesButtons = document.querySelectorAll('.favorites');

  addToFavoritesButtons.forEach((button) => {
    if (button instanceof HTMLDivElement) {
      button.addEventListener('click', toggleFavorite);
    }
  });
}

const showWarningMessage = (): void => {
  const bookButtons = document.querySelectorAll('.book-button');

  disableButtons(bookButtons);
  renderToast(
    { text: 'Данные устарели. Обновите результаты поиска', type: 'error' },
    null
  );
}

const disableButtons = (buttons: NodeListOf<Element>): void => {
  buttons.forEach((button) => {
    if (button instanceof HTMLButtonElement) {
      button.disabled = true;
    }
  })
}

const toggleFavorite = (e: Event): void => {
  if (!(e.currentTarget instanceof HTMLDivElement)) {
    return;
  }

  const id = e.currentTarget.dataset['id'];
  const name = e.currentTarget.dataset['name'];
  const favoriteButtonNextSibling = e.currentTarget.nextElementSibling;
  const image = favoriteButtonNextSibling ? favoriteButtonNextSibling.getAttribute('src') : '';

  if (!id || !name || !image) {
    return;
  }

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

  if (element) {
    element.classList.remove('active');
  }

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

  if (element) {
    element.classList.add('active');
  }

  favoriteItems.push(currentPlace);
  localStorage.setItem('favoriteItems', JSON.stringify(favoriteItems));
}
