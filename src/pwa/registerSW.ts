import { registerSW } from 'virtual:pwa-register'

type UpdateCallback = (updateSW: () => Promise<void>) => void

let updateSWCallback: UpdateCallback | null = null

export function setUpdateCallback(callback: UpdateCallback) {
  updateSWCallback = callback
}

export function initServiceWorker() {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (updateSWCallback) {
        updateSWCallback(async () => {
          await updateSW(true)
        })
      }
    },
    onOfflineReady() {
      console.log('App ready for offline use')
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error:', error)
    },
  })

  return updateSW
}
