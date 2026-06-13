const databaseName = "joujou-ai-voice-workshop"
const storeName = "history-reference-audio"
const databaseVersion = 1

interface StoredReferenceAudio {
  id: string
  blob: Blob
  name: string
  type: string
  lastModified: number
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(storeName)) database.createObjectStore(storeName, { keyPath: "id" })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error("无法打开参考音频存储"))
  })
}

export async function saveHistoryReferenceAudio(id: string, file: File): Promise<void> {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).put({
        id,
        blob: file,
        name: file.name,
        type: file.type,
        lastModified: file.lastModified,
      } satisfies StoredReferenceAudio)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error("无法保存参考音频"))
      transaction.onabort = () => reject(transaction.error || new Error("参考音频保存已中止"))
    })
  } finally {
    database.close()
  }
}

export async function getHistoryReferenceAudio(id: string): Promise<File | null> {
  const database = await openDatabase()
  try {
    const record = await new Promise<StoredReferenceAudio | undefined>((resolve, reject) => {
      const request = database.transaction(storeName, "readonly").objectStore(storeName).get(id)
      request.onsuccess = () => resolve(request.result as StoredReferenceAudio | undefined)
      request.onerror = () => reject(request.error || new Error("无法读取参考音频"))
    })
    if (!record) return null
    return new File([record.blob], record.name, {
      type: record.type || record.blob.type,
      lastModified: record.lastModified,
    })
  } finally {
    database.close()
  }
}

export async function deleteHistoryReferenceAudio(id: string): Promise<void> {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).delete(id)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error("无法删除参考音频"))
    })
  } finally {
    database.close()
  }
}
