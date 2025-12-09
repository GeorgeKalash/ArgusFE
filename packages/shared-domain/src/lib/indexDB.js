const DB_NAME = 'argus'

async function getDBVersion(DB_NAME) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME)

    request.onsuccess = event => {
      const db = event.target.result
      const version = db.version
      db.close()
      resolve(version)
    }

    request.onerror = () => resolve(1)
  })
}

async function openDB(STORE_NAME = 'tableSettings') {
  let version = 1

  if (indexedDB.databases) {
    const databases = await indexedDB.databases()
    const dbInfo = databases.find(db => db.name === DB_NAME)
    if (dbInfo) {
      version = dbInfo.version
    }
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version)
    if (STORE_NAME) {
      request.onupgradeneeded = event => {
        const db = event.target.result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }

      request.onsuccess = () => setTimeout(() => resolve(request.result), 0)

      request.onerror = () => reject(request.error)
    }
  })
}

async function saveToDB(STORE_NAME, key, value) {
  const db = await openDB(STORE_NAME)
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  store.put({ id: key, value })

  return transaction.complete
}

async function deleteRowDB(STORE_NAME, key) {
  const db = await openDB(STORE_NAME)
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const request = store.delete(key)

    request.onsuccess = () => resolve(true)

    request.onerror = () => reject(false)
  })
}

async function getFromDB(STORE_NAME, key) {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => resolve(request.result ? request.result.value : null)
    request.onerror = () => reject(request.error)
  })
}

export { getFromDB, saveToDB, deleteRowDB }
