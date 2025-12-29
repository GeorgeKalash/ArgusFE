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

  if (STORE_NAME && indexedDB.databases) {
    const databases = await indexedDB.databases()
    const dbInfo = databases.find(db => db.name === DB_NAME)
    if (dbInfo) version = dbInfo.version
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version)

    request.onupgradeneeded = event => {
      const db = event.target.result
      if (STORE_NAME && !db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }

    request.onsuccess = event => {
      const db = event.target.result
      if (STORE_NAME && !db.objectStoreNames.contains(STORE_NAME)) {
        db.close()
        const upgradeRequest = indexedDB.open(DB_NAME, db.version + 1)
        upgradeRequest.onupgradeneeded = e => {
           e.target.result && e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
        upgradeRequest.onsuccess = e => resolve(e.target.result)
        upgradeRequest.onerror = e => reject(e.target.error)
      } else {
        resolve(db)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

async function saveToDB(STORE_NAME, key, value) {
  const db = await openDB(STORE_NAME)
  if (!db.objectStoreNames.contains(STORE_NAME)) throw new Error(`Object store ${STORE_NAME} not found`)
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  const store = transaction.objectStore(STORE_NAME)
  store.put({ id: key, value })

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve(true)
    transaction.onerror = () => reject(transaction.error)
  })
}

async function deleteFromDB(STORE_NAME, key) {
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
  const db = await openDB(STORE_NAME)
  if (!db.objectStoreNames.contains(STORE_NAME)) return null

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(key)

    request.onsuccess = () => resolve(request.result ? request.result.value : null)
    request.onerror = () => reject(request.error)
  })
}

export { saveToDB, getFromDB, deleteFromDB }
