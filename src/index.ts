// dsh-maestro-dashboard — Maestro Dashboard — unified Control Center (Overview/Plugins/Usage) DSH-native
import { DASHBOARD_CHANNEL } from './shared/channels.ts'

export default {
  inject: [] as const,
  apply(ctx: any) {
    ctx.effect(() => {
      // Host RPC placeholder — full handlers in Task 7
      if (ctx.connection?.rpc?.handle) {
        return ctx.connection.rpc.handle(DASHBOARD_CHANNEL, async (payload: any) => {
          return { v: 1, generatedAt: Date.now(), data: null }
        })
      }
      return () => {}
    })
  },
}
