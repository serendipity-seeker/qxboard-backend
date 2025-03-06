/**
 * Recursively convert all BigInt fields in an object (or array)
 * to string.
 */
export function bigintConvert<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString() as unknown as T;
  }

  if (value instanceof Date) {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => bigintConvert(item)) as unknown as T;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    const convertedEntries = entries.map(([key, val]) => {
      return [key, bigintConvert(val)];
    });

    return Object.fromEntries(convertedEntries) as T;
  }

  return value;
}
