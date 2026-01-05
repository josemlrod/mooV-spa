import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { setUpdateCallback } from '@/pwa/registerSW'
import { Button } from '@/components/ui/button'

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    setUpdateCallback((updateSW) => {
      setUpdateFn(() => updateSW)
      setShowUpdate(true)
    })
  }, [])

  const handleUpdate = async () => {
    if (updateFn) {
      await updateFn()
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/95 p-4 shadow-lg backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">Update Available</p>
          <p className="text-xs text-muted-foreground">A new version of MooV is ready</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
          
          <Button
            onClick={handleUpdate}
            size="sm"
            className="shrink-0"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}
