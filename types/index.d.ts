export type QuotaWindow = {
  kind: string
  percentUsed: number
  resetsAt?: string
}

declare module 'claude-code' {
  interface PluginState {
    'openquota': {
      limits: Shaped<QuotaWindow[] | null>
      isCollapsed: boolean
    }
  }
}
