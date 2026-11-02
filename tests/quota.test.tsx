import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'openquota',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10 },
} as const

const LIMITS = [
  { kind: 'seven_day', percentUsed: 41, resetsAt: '2026-11-05T10:00:00Z' },
  { kind: 'five_hour', percentUsed: 87.5, resetsAt: '2026-11-02T17:30:00Z' },
]

test('the band shows both windows with their reset time', async ($, on) => {
  on('state.get', (_, e) => ({
    value:
      e.key === 'limits'
        ? { value: { shape: 'limits-1', value: LIMITS }, version: 1 }
        : { value: undefined, version: 0 },
  }))
  on('clock.now', () => ({ value: Date.parse('2026-11-02T15:00:00Z') }))

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /Session 5 h/ }))?.text).toBe('Session 5 h')
  expect((await ui.find({ type: 'Text', text: /88 %/ }))?.text).toBe('88 %')
  expect((await ui.find({ type: 'Text', text: /2 h 30/ }))?.text).toBe('↻ 2 h 30')
  expect((await ui.find({ type: 'Text', text: /2 j 19 h/ }))?.text).toBe('↻ 2 j 19 h')
  await ui.unmount()
})

test('before any reading the band says how to load it', async ($, on) => {
  on('state.get', () => ({ value: { value: undefined, version: 0 } }))
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe(
    'Quota : envoie un message pour le charger',
  )
  await ui.unmount()
})
