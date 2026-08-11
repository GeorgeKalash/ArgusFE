import { useEffect, useRef, useState, createElement as h } from 'react'

// Free, no-key API: https://gold-api.com (CORS-enabled, no rate limit on live prices)
const API_BASE = 'https://api.gold-api.com/price'
const GRAMS_PER_OZ = 31.1034768

// SAR is pegged to USD at a fixed rate (has been ~3.75 for decades).
// If you need other currencies gold-api already supports directly (EUR, GBP, INR, etc.),
// just call `${API_BASE}/XAU/EUR` instead of doing this manual conversion.
const USD_TO_SAR = 3.75

const REFRESH_MS = 30000 // API asks that live prices be cached ~30s

async function fetchSpotUSD(symbol) {
  const res = await fetch(`${API_BASE}/${symbol}`)
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`)
  const data = await res.json()

  return data.price // USD per troy oz
}

function useMetalPrices() {
  const [prices, setPrices] = useState(null)
  const [error, setError] = useState(null)
  const prevPrices = useRef({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [xauUsdOz, xagUsdOz] = await Promise.all([fetchSpotUSD('XAU'), fetchSpotUSD('XAG')])

        const goldSarPerGram = (xauUsdOz * USD_TO_SAR) / GRAMS_PER_OZ

        const next = {
          gold24k: goldSarPerGram,
          gold21k: goldSarPerGram * (21 / 24),
          gold18k: goldSarPerGram * (18 / 24),
          goldUsdOz: xauUsdOz,
          silverUsdOz: xagUsdOz
        }

        if (!cancelled) {
          setPrices({ current: next, previous: prevPrices.current })
          prevPrices.current = next
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    load()
    const id = setInterval(load, REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { prices, error }
}

function trend(current, previous) {
  if (previous == null) return 'flat'
  if (current > previous) return 'up'
  if (current < previous) return 'down'

  return 'flat'
}

function Arrow(props) {
  const direction = props.direction
  if (direction === 'up') {
    return h(
      'svg',
      { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 3 },
      h('path', { d: 'M6 15l6-6 6 6', strokeLinecap: 'round', strokeLinejoin: 'round' })
    )
  }
  if (direction === 'down') {
    return h(
      'svg',
      { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 3 },
      h('path', { d: 'M6 9l6 6 6-6', strokeLinecap: 'round', strokeLinejoin: 'round' })
    )
  }

  return h('span', { style: { width: 12, display: 'inline-block' } }, '\u2013')
}

function PriceCell(props) {
  const label = props.label
  const value = props.value
  const currency = props.currency
  const direction = props.direction
  const divider = props.divider

  const color = direction === 'up' ? '#3ddc7a' : direction === 'down' ? '#ff6b6b' : '#9a9a9a'

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 20px',
        borderLeft: divider ? '1px solid #d4a94a' : '1px solid rgba(255,255,255,0.08)',
        minWidth: 110
      }
    },
    h('span', { style: { fontSize: 12, color: '#b7b7b7' } }, label),
    h(
      'span',
      { style: { fontSize: 18, fontWeight: 600, color: '#f2f2f2' } },
      value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    ),
    h(
      'span',
      { style: { display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 12, fontWeight: 600 } },
      h(Arrow, { direction }),
      currency
    )
  )
}

export default function GoldPriceTicker() {
  const state = useMetalPrices()
  const prices = state.prices
  const error = state.error

  if (error) {
    return h(
      'div',
      { style: { background: '#1c1c1c', color: '#ff6b6b', padding: 12, borderRadius: 8, fontSize: 13 } },
      `Couldn't load prices: ${error}`
    )
  }

  if (!prices) {
    return h(
      'div',
      { style: { background: '#1c1c1c', color: '#b7b7b7', padding: 12, borderRadius: 8, fontSize: 13 } },
      'Loading prices\u2026'
    )
  }

  const current = prices.current
  const previous = prices.previous

  const cells = [
    { key: 'gold24k', label: 'Gold 24K', value: current.gold24k, currency: 'SAR' },
    { key: 'gold21k', label: 'Gold 21K', value: current.gold21k, currency: 'SAR' },
    { key: 'gold18k', label: 'Gold 18K', value: current.gold18k, currency: 'SAR' },
    { key: 'goldUsdOz', label: 'Gold', value: current.goldUsdOz, currency: 'USD', divider: true },
    { key: 'silverUsdOz', label: 'Silver', value: current.silverUsdOz, currency: 'USD', divider: true }
  ]

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a)',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: 'system-ui, sans-serif',
        width: 'fit-content'
      }
    },
    cells.map((c, i) =>
      h(PriceCell, {
        key: c.key,
        label: c.label,
        value: c.value,
        currency: c.currency,
        direction: trend(c.value, previous[c.key]),
        divider: c.divider && i !== 0
      })
    )
  )
}
