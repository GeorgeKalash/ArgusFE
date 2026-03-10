export function emitError(e) {
  try {
    window.dispatchEvent(new CustomEvent('app:error', { detail: e }))
  } catch {
    console.error(e)
  }
}
