import { useEffect, useRef, useState, createElement as h } from 'react'

const API_BASE = 'https://api.gold-api.com/price'
const GRAMS_PER_OZ = 31.1034768

const PEGGED_RATES = {
  SAR: 3.75
}

const REFRESH_MS = 30000 

async function fetchSpotUSD(symbol) {
  const res = await fetch(`${API_BASE}/${symbol}`)
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`)
  const data = await res.json()

  return data.price 
}

async function fetchSpotInCurrency(symbol, currency) {
  if (currency === 'USD') return fetchSpotUSD(symbol)

  if (PEGGED_RATES[currency]) {
    const usd = await fetchSpotUSD(symbol)
    return usd * PEGGED_RATES[currency]
  }

  const res = await fetch(`${API_BASE}/${symbol}/${currency}`)
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}/${currency}`)
  const data = await res.json()

  return data.price
}

function useMetalPrices(karatCurrency) {
  const [prices, setPrices] = useState(null)
  const [error, setError] = useState(null)
  const prevPrices = useRef({})

  useEffect(() => {
    let cancelled = false
    prevPrices.current = {} 

    async function load() {
      try {
        const needsSeparateUsdFetch = karatCurrency !== 'USD'

        const [xauKarat, xagUsd, xauUsd] = await Promise.all([
          fetchSpotInCurrency('XAU', karatCurrency),
          fetchSpotUSD('XAG'),
          needsSeparateUsdFetch ? fetchSpotUSD('XAU') : Promise.resolve(null)
        ])

        const goldPerGramKarat = xauKarat / GRAMS_PER_OZ

        const next = {
          gold24k: goldPerGramKarat,
          gold21k: goldPerGramKarat * (21 / 24),
          gold18k: goldPerGramKarat * (18 / 24),
          goldOzUsd: needsSeparateUsdFetch ? xauUsd : xauKarat,
          silverOzUsd: xagUsd
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
  }, [karatCurrency])

  return { prices, error }
}

function trend(current, previous) {
  if (previous == null) return 'up' // default to green on first load, matches reference
  if (current > previous) return 'up'
  if (current < previous) return 'down'

  return 'flat'
}

function trendColor(direction) {
  if (direction === 'up') return '#3ddc7a'
  if (direction === 'down') return '#ff6b6b'

  return '#9a9a9a'
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
  const showDivider = props.showDivider

  const color = trendColor(direction)

  return h(
    'div',
    {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 20px',
        borderLeft: showDivider ? '1px solid #d4a94a' : '1px solid rgba(255,255,255,0.08)',
        minWidth: 110
      }
    },
    showDivider &&
      h('span', {
        style: {
          position: 'absolute',
          top: -1,
          left: -3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#d4a94a'
        }
      }),
    h('span', { style: { fontSize: 12, color: '#c9c9c9' } }, label),
    h('span', { style: { fontSize: 18, fontWeight: 700, color } }, value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
    h(
      'span',
      { style: { display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 12, fontWeight: 600 } },
      h(Arrow, { direction }),
      currency
    )
  )
}

export default function GoldPriceTicker(props) {
  const karatCurrency = props.currency || 'SAR'
  const state = useMetalPrices(karatCurrency)
  const prices = state.prices
  const error = state.error

  if (error) {
    return h(
      'div',
      { style: { background: '#1c1c1c', color: '#ff6b6b', padding: 12, borderRadius: 8, fontSize: 13, ...props.style } },
      `Couldn't load prices: ${error}`
    )
  }

  if (!prices) {
    return h(
      'div',
      { style: { background: '#1c1c1c', color: '#b7b7b7', padding: 12, borderRadius: 8, fontSize: 13, ...props.style } },
      'Loading prices\u2026'
    )
  }

  const current = prices.current
  const previous = prices.previous

  const cells = [
    { key: 'gold24k', label: 'Gold 24K', value: current.gold24k, currency: karatCurrency },
    { key: 'gold21k', label: 'Gold 21K', value: current.gold21k, currency: karatCurrency },
    { key: 'gold18k', label: 'Gold 18K', value: current.gold18k, currency: karatCurrency },
    { key: 'goldOzUsd', label: 'Gold', value: current.goldOzUsd, currency: 'USD' },
    { key: 'silverOzUsd', label: 'Silver', value: current.silverOzUsd, currency: 'USD' }
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
        width: 'fit-content',
        ...props.style
      }
    },
    cells.map((c, i) =>
      h(PriceCell, {
        key: c.key,
        label: c.label,
        value: c.value,
        currency: c.currency,
        direction: trend(c.value, previous[c.key]),
        showDivider: i !== 0
      })
    )
  )
}