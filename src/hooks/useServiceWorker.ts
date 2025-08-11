import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const useServiceWorker = () => {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js')
      setRegistration(reg)
      
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true)
              toast('App update available!', {
                duration: 5000,
                icon: '🔄',
              })
            }
          })
        }
      })

      // Check if app is installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }

    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  const updateApp = () => {
    if (isUpdateAvailable && registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const subscribeToPushNotifications = async () => {
    if (!registration || !('PushManager' in window)) {
      return null
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  return {
    isInstalled,
    isUpdateAvailable,
    updateApp,
    subscribeToPushNotifications,
  }
}