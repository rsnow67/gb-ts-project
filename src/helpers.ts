export function getUserData(key: string): object | Error {
  const localStorageItem = localStorage.getItem(key);

  if (localStorageItem === null) {
    throw new Error(`Айтем с ключом "${key}" не существует.`);
  }

  const value: unknown = JSON.parse(localStorageItem);

  if (typeof value === 'object' && value !== null && 'userName' in value && 'avatarUrl' in value) {
    return value;
  }

  throw new Error('Данные по этому ключу не соответствуют UserData.');
}

export function getFavoritesAmount(key: string): number | null {
  const localStorageItem = localStorage.getItem(key);

  if (localStorageItem === null) {
    return null;
  }

  const data: unknown = JSON.parse(localStorageItem);

  if (Array.isArray(data)) {
    return data.length;
  }

  return null;
}
