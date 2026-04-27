"use client";

const CART_KEY = "cart";
const WISHLIST_KEY = "wishlist";
const STORAGE_SOURCES = ["local", "session", "memory"];
const EMPTY_STORAGE_LIST = Object.freeze([]);
const memoryStorage = new Map();
const storageSnapshotCache = new Map([
  [CART_KEY, { source: "memory", raw: null, items: EMPTY_STORAGE_LIST }],
  [WISHLIST_KEY, { source: "memory", raw: null, items: EMPTY_STORAGE_LIST }],
]);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Math.trunc(Number(value));
  return parsed > 0 ? parsed : fallback;
};

const cleanString = (value) => (isNonEmptyString(value) ? value.trim() : null);

const sanitizeImage = (...values) => {
  for (const value of values) {
    const cleaned = cleanString(value);
    if (cleaned) {
      return cleaned;
    }
  }
  return null;
};

const getStorageArea = (source) => {
  if (typeof window === "undefined") {
    return null;
  }

  if (source === "local") {
    return window.localStorage;
  }

  if (source === "session") {
    return window.sessionStorage;
  }

  return null;
};

const getCachedSnapshot = (key) =>
  storageSnapshotCache.get(key) || {
    source: "memory",
    raw: null,
    items: EMPTY_STORAGE_LIST,
  };

const setCachedSnapshot = (key, source, raw, items) => {
  storageSnapshotCache.set(key, {
    source,
    raw,
    items: items.length > 0 ? items : EMPTY_STORAGE_LIST,
  });
};

const readRawValue = (source, key) => {
  try {
    if (source === "memory") {
      return memoryStorage.get(key) ?? null;
    }

    const storage = getStorageArea(source);
    return storage ? storage.getItem(key) : null;
  } catch {
    return null;
  }
};

const removeRawValue = (source, key) => {
  try {
    if (source === "memory") {
      memoryStorage.delete(key);
      return true;
    }

    const storage = getStorageArea(source);
    if (!storage) {
      return false;
    }

    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const writeRawValue = (source, key, rawValue) => {
  try {
    if (source === "memory") {
      if (rawValue == null) {
        memoryStorage.delete(key);
      } else {
        memoryStorage.set(key, rawValue);
      }
      return null;
    }

    const storage = getStorageArea(source);
    if (!storage) {
      return new Error(`Storage source unavailable: ${source}`);
    }

    if (rawValue == null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, rawValue);
    }

    return null;
  } catch (error) {
    return error;
  }
};

const clearOtherSources = (key, activeSource) => {
  STORAGE_SOURCES.forEach((source) => {
    if (source !== activeSource) {
      removeRawValue(source, key);
    }
  });
};

const buildSourceOrder = (preferredSource = "local") => [
  preferredSource,
  ...STORAGE_SOURCES.filter((source) => source !== preferredSource),
];

const persistSnapshot = (
  key,
  items,
  serializedItems,
  preferredSource = "local",
) => {
  let lastError = null;

  for (const source of buildSourceOrder(preferredSource)) {
    let writeError = writeRawValue(source, key, serializedItems);

    if (writeError && isQuotaExceededError(writeError) && source !== "memory") {
      removeRawValue(source, key);
      writeError = writeRawValue(source, key, serializedItems);
    }

    if (!writeError) {
      clearOtherSources(key, source);
      setCachedSnapshot(key, source, serializedItems, items);
      return {
        ok: true,
        items,
        storage: source,
      };
    }

    lastError = writeError;
  }

  setCachedSnapshot(key, "memory", serializedItems, items);

  return {
    ok: false,
    reason: isQuotaExceededError(lastError) ? "quota" : "unknown",
    items,
    error: lastError,
  };
};

export const getCartItemKey = (item) =>
  `${item?.id ?? "unknown"}-${item?.variant_id ?? "default"}`;

export const isQuotaExceededError = (error) =>
  error?.name === "QuotaExceededError" ||
  error?.code === 22 ||
  error?.code === 1014;

export const sanitizeCartItem = (item) => {
  if (!item || item.id == null) {
    return null;
  }

  return {
    id: item.id,
    name: cleanString(item.name) || "Product",
    category:
      cleanString(item.category) || cleanString(item.category_name) || null,
    variant_id: item.variant_id ?? null,
    selectedColor: cleanString(item.selectedColor),
    selectedSize: cleanString(item.selectedSize),
    price: toNumber(item.price),
    quantity: toPositiveInt(item.quantity, 1),
    stock: Math.max(0, toPositiveInt(item.stock, 0)),
    image: sanitizeImage(item.image, item.variant_image, item.image_url),
  };
};

export const sanitizeWishlistItem = (item) => {
  if (!item || item.id == null) {
    return null;
  }

  const normalizedStock = Math.max(
    0,
    toPositiveInt(item.stock, toPositiveInt(item.variant_stock, 0)),
  );
  const normalizedVariantStock = Math.max(
    0,
    toPositiveInt(item.variant_stock, normalizedStock),
  );

  return {
    id: item.id,
    name: cleanString(item.name) || "Product",
    category_name:
      cleanString(item.category_name) || cleanString(item.category) || null,
    image: sanitizeImage(item.image, item.variant_image, item.image_url),
    price: toNumber(item.price),
    stock: normalizedStock,
    variant_id: item.variant_id ?? null,
    selectedColor: cleanString(item.selectedColor),
    selectedSize: cleanString(item.selectedSize),
    has_variants: Boolean(item.has_variants),
    variant_price: toNumber(item.variant_price, toNumber(item.price)),
    variant_stock: normalizedVariantStock,
    variant_image: sanitizeImage(
      item.variant_image,
      item.image,
      item.image_url,
    ),
  };
};

const parseStoredList = (key, sanitizer) => {
  if (typeof window === "undefined") {
    return EMPTY_STORAGE_LIST;
  }

  const cachedSnapshot = getCachedSnapshot(key);

  for (const source of STORAGE_SOURCES) {
    const rawValue = readRawValue(source, key);
    if (rawValue == null) {
      continue;
    }

    if (cachedSnapshot.source === source && cachedSnapshot.raw === rawValue) {
      return cachedSnapshot.items;
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      if (!Array.isArray(parsedValue)) {
        setCachedSnapshot(key, source, rawValue, EMPTY_STORAGE_LIST);
        return EMPTY_STORAGE_LIST;
      }

      const sanitizedItems = parsedValue.map(sanitizer).filter(Boolean);
      const finalItems =
        sanitizedItems.length > 0 ? sanitizedItems : EMPTY_STORAGE_LIST;
      const normalizedValue = JSON.stringify(finalItems);

      if (normalizedValue !== rawValue) {
        const result = persistSnapshot(
          key,
          finalItems,
          normalizedValue,
          source,
        );
        return result.items;
      }

      setCachedSnapshot(key, source, rawValue, finalItems);
      return finalItems;
    } catch {
      removeRawValue(source, key);
    }
  }

  setCachedSnapshot(key, "memory", null, EMPTY_STORAGE_LIST);
  return EMPTY_STORAGE_LIST;
};

const saveStoredList = (key, items, sanitizer) => {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "unavailable",
      items: [],
    };
  }

  const sanitizedItems = (Array.isArray(items) ? items : [])
    .map(sanitizer)
    .filter(Boolean);
  const finalItems =
    sanitizedItems.length > 0 ? sanitizedItems : EMPTY_STORAGE_LIST;
  const serializedItems = JSON.stringify(finalItems);

  return persistSnapshot(key, finalItems, serializedItems);
};

export const loadCart = () => parseStoredList(CART_KEY, sanitizeCartItem);

export const saveCart = (items) =>
  saveStoredList(CART_KEY, items, sanitizeCartItem);

export const loadWishlist = () =>
  parseStoredList(WISHLIST_KEY, sanitizeWishlistItem);

export const saveWishlist = (items) =>
  saveStoredList(WISHLIST_KEY, items, sanitizeWishlistItem);

const clearStoredList = (key) => {
  STORAGE_SOURCES.forEach((source) => {
    removeRawValue(source, key);
  });
  setCachedSnapshot(key, "memory", null, EMPTY_STORAGE_LIST);
};

export const clearCart = () => clearStoredList(CART_KEY);

export const clearWishlist = () => clearStoredList(WISHLIST_KEY);

export const dispatchCartSync = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("cartUpdate"));
};
