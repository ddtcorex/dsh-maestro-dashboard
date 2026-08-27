import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

export default {
  // Client half — DSH will call apply with ctx containing slots
  apply(ctx: any) {
    // Inject Maestro trigger above Settings in sidebar
    ctx.effect(() => {
      if (ctx.slots?.inject) {
        return ctx.slots.inject('sidebar:settingsArea:before', () => React.createElement(MaestroTrigger, { health: 'ok' }))
      }
      // Fallback: try generic sidebar slot
      try {
        return ctx.slots.inject('sidebar', () => React.createElement(MaestroTrigger, { health: 'ok' }))
      } catch {
        return () => {}
      }
    })

    // Portal overlay — controlled via local state in host UI
    ctx.effect(() => {
      // Expose overlay via slot if needed
      return () => {}
    })
  },
}
