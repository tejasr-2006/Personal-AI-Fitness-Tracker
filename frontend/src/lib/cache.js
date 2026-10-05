// Session-lifetime cache so AI results (slow + billed) survive page navigation.
const store = new Map();
export const aiCache = {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    clear: () => store.clear(),
};
