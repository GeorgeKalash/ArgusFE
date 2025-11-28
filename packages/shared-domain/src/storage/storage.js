const getStorageData = key => {
  const userData = window.sessionStorage.getItem(key)

  return userData ? JSON.parse(userData) : null
}

export { getStorageData }
