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

export function dateToUnixStamp(date: Date) {
  return date.getTime() / 1000
}
