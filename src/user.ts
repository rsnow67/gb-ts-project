import { getFavoritesAmount } from './helpers.js';
import { renderBlock } from './lib.js';

export function renderUserBlock (userName = 'Wade Warren', avatarUrl = '/img/avatar.png') {
  const favoriteItemsAmount = getFavoritesAmount('favoriteItems');
  const favoritesCaption = favoriteItemsAmount || 'ничего нет';
  const hasFavoriteItems = !!favoriteItemsAmount;

  renderBlock(
    'user-block',
    `
    <div class="header-container">
      <img class="avatar" src="${avatarUrl}" alt=${userName} />
      <div class="info">
          <p class="name">${userName}</p>
          <p class="fav">
            <i class="heart-icon${hasFavoriteItems ? ' active' : ''}"></i>${favoritesCaption}
          </p>
      </div>
    </div>
    `
  );
}
