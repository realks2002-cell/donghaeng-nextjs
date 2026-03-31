export function isNativeApp(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== 'undefined' && !!(window as any).Capacitor
}

let backButtonInitialized = false

export async function setupBackButton() {
  if (!isNativeApp() || backButtonInitialized) return
  backButtonInitialized = true

  const { App } = await import('@capacitor/app')

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      App.minimizeApp()
    }
  })
}
