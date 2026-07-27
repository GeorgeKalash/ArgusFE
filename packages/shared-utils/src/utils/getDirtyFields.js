function getDirtyFields(values, initialValues, path = '') {
  let changes = [];

  Object.keys(values || {}).forEach(key => {
    const currentPath = path ? `${path}.${key}` : key;

    const current = values[key];
    const initial = initialValues?.[key];

    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      initial &&
      typeof initial === 'object'
    ) {
      changes = changes.concat(
        getDirtyFields(current, initial, currentPath)
      );
    } else if (JSON.stringify(current) !== JSON.stringify(initial)) {
      changes.push({
        field: currentPath,
        current,
        initial
      });
    }
  });

  return changes;
}

export {
  getDirtyFields
}