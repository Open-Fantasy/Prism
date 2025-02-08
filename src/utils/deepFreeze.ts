/**
 * Deep Freeze function for where thats needed freezes an object recursively to create a read only version
 * @param obj object to deep freeze
 * @returns if obj is undefined returns empty frozen object (useless case but needed for to do something in this situation)
 * @returns if obj is a populated object returns a recursively frozen object making it entirely readonly
 */
export function deepFreeze(obj: object): object {
  const temp = obj as { [key: string]: unknown };
  if (!temp) return Object.freeze({});
  Object.freeze(temp);

  Object.keys(temp).forEach((key) => {
    const value = temp[key];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });

  return obj;
}
