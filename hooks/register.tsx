import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { QuotaWindow } from '../types'

const limits = atom({ plugin: 'openquota', key: 'limits' } as const, null, {
  shape: 'limits-1',
})
const isCollapsed = atom(
  { plugin: 'openquota', key: 'isCollapsed' } as const,
  false,
)

const LABELS: Record<string, string> = {
  five_hour: 'Session 5 h',
  seven_day: 'Semaine',
  spend_limit: 'Plafond',
}
const SHORT: Record<string, string> = {
  five_hour: '5 h',
  seven_day: 'Sem.',
  spend_limit: 'Plaf.',
}
const ORDER = ['five_hour', 'seven_day', 'spend_limit']

function sorted(list: readonly QuotaWindow[]): QuotaWindow[] {
  return [...list].sort((a, b) => {
    const ia = ORDER.indexOf(a.kind)
    const ib = ORDER.indexOf(b.kind)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
}

function pct(n: number): string {
  return `${Math.round(n)} %`
}

function bar(n: number, width = 12): string {
  const filled = Math.max(0, Math.min(width, Math.round((n / 100) * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function color(n: number): string {
  if (n >= 85) return 'red'
  if (n >= 60) return 'yellow'
  return 'green'
}

function untilReset(resetsAt: string | undefined, now: number): string {
  if (!resetsAt) return ''
  const at = Date.parse(resetsAt)
  if (Number.isNaN(at)) return ''
  const minutes = Math.max(0, Math.round((at - now) / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest > 0 ? `${hours} h ${String(rest).padStart(2, '0')}` : `${hours} h`
  }
  const days = Math.floor(hours / 24)
  const restH = hours % 24
  return restH > 0 ? `${days} j ${restH} h` : `${days} j`
}

function compactLine(list: readonly QuotaWindow[], now: number): string {
  return sorted(list)
    .map(w => {
      const reset = untilReset(w.resetsAt, now)
      return `${SHORT[w.kind] ?? w.kind} ${pct(w.percentUsed)}${reset ? ` (↻ ${reset})` : ''}`
    })
    .join(' · ')
}

// Status line only on mobile: the desktop gets the band above the prompt.
async function refreshStatus($: EngineInterface): Promise<void> {
  const surfaces = await $.session.surfaces()
  const list = await read($, limits)
  if (!surfaces.includes('mobile')) {
    $.ui.status(undefined)
    return
  }
  if (!list || list.length === 0) {
    $.ui.status('Quota : envoie un message pour le charger')
    return
  }
  $.ui.status(`Quota · ${compactLine(list, await $.clock.now())}`)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'quota',
      description: 'Afficher le détail du quota Claude (session 5 h et semaine)',
    })
    const usage = await $.session.usage()
    if (usage.rateLimits.length > 0) {
      await update($, limits, () => usage.rateLimits.map(r => ({ ...r })))
    }
    await refreshStatus($)
    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      await update($, limits, () => e.rateLimits.map(r => ({ ...r })))
      await refreshStatus($)
    }
    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    const result = await next(e)
    await refreshStatus($)
    return result
  })

  on('command.run', { command: 'quota' }, async $ => {
    const usage = await $.session.usage()
    const list = usage.rateLimits.length > 0 ? usage.rateLimits : await read($, limits)
    if (!list || list.length === 0) {
      return {
        text: "Pas encore de relevé de quota. Envoie un message, puis relance /quota. (Le quota n'existe qu'avec un abonnement Pro ou Max.)",
      }
    }
    const now = await $.clock.now()
    const lines = sorted(list).map(w => {
      const reset = untilReset(w.resetsAt, now)
      return `${LABELS[w.kind] ?? w.kind} : ${bar(w.percentUsed, 20)} ${pct(w.percentUsed)} utilisé${reset ? ` — réinitialisation dans ${reset}` : ''}`
    })
    return { text: lines.join('\n') }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, limits)
    const collapsed = await read($, isCollapsed)
    const toggle = (
      <Button
        key="toggle"
        label={collapsed ? 'Afficher' : 'Réduire'}
        dimColor
        onPress={() => update($, isCollapsed, v => !v)}
      />
    )

    if (!list || list.length === 0) {
      return (
        <Box flexDirection="row" gap={1}>
          <Text dimColor>Quota : envoie un message pour le charger</Text>
        </Box>
      )
    }

    const now = await $.clock.now()

    if (collapsed) {
      return (
        <Box flexDirection="row" gap={1} alignItems="center">
          <Text dimColor>Quota · {compactLine(list, now)}</Text>
          {toggle}
        </Box>
      )
    }

    return (
      <Box flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
        {sorted(list).map(w => {
          const reset = untilReset(w.resetsAt, now)
          return (
            <Box key={w.kind} flexDirection="row" gap={1}>
              <Text dimColor>{LABELS[w.kind] ?? w.kind}</Text>
              <Text color={color(w.percentUsed)} mono>
                {bar(w.percentUsed)}
              </Text>
              <Text weight="semibold">{pct(w.percentUsed)}</Text>
              {reset !== '' && <Text dimColor>↻ {reset}</Text>}
            </Box>
          )
        })}
        {toggle}
      </Box>
    )
  })
}
