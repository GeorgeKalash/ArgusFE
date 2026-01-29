import { useCallback, useEffect, useRef, memo } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import styles from './charts.module.css'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

const sizes = {
  1024: {
    size: 10,
    tooltipBodySize: 8,
    tooltipFontSize: 8,
    ticksSize: 8
  },
  1280: {
    size: 10,
    tooltipBodySize: 8,
    tooltipFontSize: 8,
    ticksSize: 9.1
  },
  1281: {
    size: 12,
    tooltipBodySize: 8,
    tooltipFontSize: 8,
    ticksSize: 9.8
  }
}

const hasAnyValue = arr => Array.isArray(arr) && arr.length > 0 && arr.some(v => v !== null && v !== undefined)
const hasAnyLabel = arr => Array.isArray(arr) && arr.length > 0
const chartHasAnyValue = chart => {
  try {
    const labelsOk = Array.isArray(chart?.data?.labels) && chart.data.labels.length > 0
    const ds = chart?.data?.datasets || []
    const dsOk = ds.some(d => Array.isArray(d?.data) && d.data.length > 0 && d.data.some(v => v !== null && v !== undefined))
    return labelsOk || dsOk
  } catch {
    return false
  }
}

const useArgusTabActivatedResize = getChart => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const run = () => {
      const chart = getChart?.()
      if (!chart) return

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            chart.resize()
            chart.update('none')
          } catch {}
        })
      })
    }

    window.addEventListener('argus-tab-activated', run)
    run()

    return () => window.removeEventListener('argus-tab-activated', run)
  }, [getChart])
}

const getCssVar = (el, name, fallback) => {
  if (!el) return fallback
  const value = getComputedStyle(el).getPropertyValue(name)
  return value?.trim() || fallback
}

const predefinedColors = canvas => [
  getCssVar(canvas, '--chart-mixed-1'),
  getCssVar(canvas, '--chart-mixed-2'),
  getCssVar(canvas, '--chart-mixed-3'),
  getCssVar(canvas, '--chart-mixed-4'),
  getCssVar(canvas, '--chart-mixed-5'),
  getCssVar(canvas, '--chart-mixed-6'),
  getCssVar(canvas, '--chart-mixed-7')
]

const generateColors = (dataLength, canvas) => {
  const colors = predefinedColors(canvas)

  const backgroundColors = []
  const borderColors = []

  for (let i = 0; i < dataLength; i++) {
    const color = colors[i % colors.length]
    backgroundColors.push(color)
    borderColors.push(color)
  }

  return { backgroundColors, borderColors }
}

const getChartOptions = (label, type, canvas) => {
  const legendLabelColor = getCssVar(canvas, '--chart-legend-label-color')
  const titleColor = getCssVar(canvas, '--chart-title-color')
  const axisColor = getCssVar(canvas, '--chart-axis-color')

  const tooltipBg = getCssVar(canvas, '--chart-tooltip-bg')
  const tooltipTitleColor = getCssVar(canvas, '--chart-tooltip-title-color')
  const tooltipBodyColor = getCssVar(canvas, '--chart-tooltip-body-color')
  const titleSize = parseFloat(getCssVar(canvas, '--chart-title-size', 16))

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: legendLabelColor
        }
      },
      title: {
        display: true,
        text: label,
        font: {
          size: titleSize,
          weight: 'bold'
        },
        color: titleColor
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`
          }
        },
        backgroundColor: tooltipBg,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor
      }
    }
  }

  if (type === 'pie' || type === 'doughnut' || type === 'polarArea' || type === 'radar') {
    return {
      ...baseOptions,
      scales: {
        r: {
          pointLabels: {
            color: axisColor
          },
          grid: {
            color: axisColor
          },
          angleLines: {
            color: axisColor
          },
          ticks: {
            backdropColor: 'transparent',
            color: axisColor
          }
        }
      }
    }
  }

  return {
    ...baseOptions,
    scales: {
      x: {
        ticks: {
          color: axisColor
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: axisColor
        },
        grid: {
          display: false
        }
      }
    }
  }
}

export const MixedBarChart = memo(({ id, labels, data1, data2, label1, label2, ratio = 3, rotation, hasLegend }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const getChart = useCallback(() => chartRef.current, [])
  useArgusTabActivatedResize(getChart)

  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (chartRef.current) return

    const bar1Bg = getCssVar(canvas, '--chart-bar-1-bg')
    const bar1HoverBg = getCssVar(canvas, '--chart-bar-1-hover-bg')
    const bar2Bg = getCssVar(canvas, '--chart-bar-2-bg')
    const bar2HoverBg = getCssVar(canvas, '--chart-bar-2-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label: label1 || null,
            data: data1 || [],
            backgroundColor: bar1Bg,
            hoverBackgroundColor: bar1HoverBg
          },
          {
            label: label2 || null,
            data: data2 || [],
            backgroundColor: bar2Bg,
            hoverBackgroundColor: bar2HoverBg
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: ratio,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          },
          datalabels: {
            anchor: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight

              return barHeight >= 120 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight

              return barHeight >= 120 ? 'center' : 'end'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight

              return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            rotation: rotation || 0,
            font: { size: chartSize.size },
            formatter: (value, context) => {
              const datasetIndex = context.datasetIndex
              const lbl = datasetIndex === 0 ? label1 : label2
              const roundedValue = Math.ceil(value)

              if (hasLegend) return `${roundedValue.toLocaleString()}`
              return `${lbl ? lbl + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: hasLegend || false
          }
        },
        scales: {
          x: {
            ticks: {
              font: { size: chartSize.ticksSize }
            }
          },
          y: {
            ticks: {
              font: { size: chartSize.ticksSize },
              callback: function (value) {
                if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                return value
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    const canvas = canvasRef.current
    if (!chart || !canvas) return

    const nextHasMeaningful =
      hasAnyLabel(labels) && (hasAnyValue(data1) || hasAnyValue(data2) || (Array.isArray(data1) && Array.isArray(data2)))
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const bar1Bg = getCssVar(canvas, '--chart-bar-1-bg')
    const bar1HoverBg = getCssVar(canvas, '--chart-bar-1-hover-bg')
    const bar2Bg = getCssVar(canvas, '--chart-bar-2-bg')
    const bar2HoverBg = getCssVar(canvas, '--chart-bar-2-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label1 || null
    chart.data.datasets[0].data = data1 || []
    chart.data.datasets[0].backgroundColor = bar1Bg
    chart.data.datasets[0].hoverBackgroundColor = bar1HoverBg

    chart.data.datasets[1].label = label2 || null
    chart.data.datasets[1].data = data2 || []
    chart.data.datasets[1].backgroundColor = bar2Bg
    chart.data.datasets[1].hoverBackgroundColor = bar2HoverBg

    chart.options.aspectRatio = ratio

    chart.options.plugins.tooltip.bodyFont.size = chartSize.tooltipBodySize
    chart.options.plugins.tooltip.titleFont.size = chartSize.tooltipFontSize

    chart.options.plugins.datalabels.rotation = rotation || 0
    chart.options.plugins.datalabels.font.size = chartSize.size
    chart.options.plugins.datalabels.color = context => {
      const c = context.chart
      const dataset = context.dataset
      const value = dataset.data[context.dataIndex]
      const chartHeight = c.scales.y.bottom - c.scales.y.top
      const maxValue = c.scales.y.max
      const barHeight = (value / maxValue) * chartHeight
      return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
    }

    chart.options.plugins.legend.display = hasLegend || false

    chart.options.scales.x.ticks.font.size = chartSize.ticksSize
    chart.options.scales.y.ticks.font.size = chartSize.ticksSize

    chart.update('none')
  }, [labels, data1, data2, label1, label2, ratio, rotation, hasLegend, chartSize])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={canvasRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`} />
    </div>
  )
})

export const HorizontalBarChartDark = memo(({ id, labels, data, label, color, hoverColor }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  const getChart = useCallback(() => chartInstanceRef.current, [])
  useArgusTabActivatedResize(getChart)

  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (chartInstanceRef.current) return

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: barBg,
            hoverBackgroundColor: barHoverBg,
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            max: Math.max(...(data || [0])) * 1.1,
            ticks: { font: { size: chartSize.ticksSize } }
          },
          y: {
            ticks: { font: { size: chartSize.ticksSize } }
          }
        },
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          },
          datalabels: {
            anchor: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? 'center' : 'right'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            font: { size: chartSize.size },
            formatter: value => `${Math.ceil(value).toLocaleString()}`
          },
          legend: { display: false }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartInstanceRef.current?.destroy()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = chartRef.current
    const chart = chartInstanceRef.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = barBg
    chart.data.datasets[0].hoverBackgroundColor = barHoverBg

    chart.options.plugins.tooltip.bodyFont.size = chartSize.tooltipBodySize
    chart.options.plugins.tooltip.titleFont.size = chartSize.tooltipFontSize
    chart.options.plugins.datalabels.font.size = chartSize.size

    chart.options.plugins.datalabels.color = context => {
      const c = context.chart
      const dataset = context.dataset
      const value = dataset.data[context.dataIndex]
      const chartWidth = c.scales.x.right - c.scales.x.left
      const maxValue = c.scales.x.max
      const barWidth = (value / maxValue) * chartWidth
      return barWidth >= 65 ? datalabelInsideColor : datalabelOutsideColor
    }

    chart.options.scales.x.max = Math.max(...(data || [0])) * 1.1
    chart.options.scales.x.ticks.font.size = chartSize.ticksSize
    chart.options.scales.y.ticks.font.size = chartSize.ticksSize

    chart.update('none')
  }, [id, labels, data, label, color, hoverColor, chartSize])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={chartRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
    </div>
  )
})

export const CompositeBarChartDark = memo(({ id, labels, data, label, color, hoverColor, ratio = 3 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const getChart = useCallback(() => chartRef.current, [])
  useArgusTabActivatedResize(getChart)

  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (chartRef.current) return

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: barBg,
            hoverBackgroundColor: barHoverBg,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: ratio,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          },
          datalabels: {
            anchor: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? 'center' : 'end'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            rotation: -90,
            font: { size: chartSize.size },
            formatter: value => value.toLocaleString()
          },
          legend: { display: false }
        },
        scales: {
          x: { ticks: { font: { size: chartSize.ticksSize } } },
          y: { ticks: { font: { size: chartSize.ticksSize } } }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const chart = chartRef.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = barBg
    chart.data.datasets[0].hoverBackgroundColor = barHoverBg

    chart.options.aspectRatio = ratio
    chart.options.plugins.tooltip.bodyFont.size = chartSize.tooltipBodySize
    chart.options.plugins.tooltip.titleFont.size = chartSize.tooltipFontSize
    chart.options.plugins.datalabels.font.size = chartSize.size

    chart.options.plugins.datalabels.color = context => {
      const c = context.chart
      const dataset = context.dataset
      const value = dataset.data[context.dataIndex]
      const chartHeight = c.scales.y.bottom - c.scales.y.top
      const maxValue = c.scales.y.max
      const barHeight = (value / maxValue) * chartHeight
      return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
    }

    chart.options.scales.x.ticks.font.size = chartSize.ticksSize
    chart.options.scales.y.ticks.font.size = chartSize.ticksSize

    chart.update('none')
  }, [labels, data, label, color, hoverColor, ratio, chartSize])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={canvasRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`} />
    </div>
  )
})

export const MixedColorsBarChartDark = memo(({ id, labels, data, label, ratio = 3 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const getChart = useCallback(() => chartRef.current, [])
  useArgusTabActivatedResize(getChart)

  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (chartRef.current) return

    const colors = generateColors((data || []).length, canvas)

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: colors.backgroundColors,
            borderColor: colors.borderColors,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: ratio,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          },
          datalabels: {
            anchor: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? 'center' : 'end'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]
              const chartHeight = chart.scales.y.bottom - chart.scales.y.top
              const maxValue = chart.scales.y.max
              const barHeight = (value / maxValue) * chartHeight
              return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            font: { size: chartSize.size },
            formatter: (value, _) => {
              const roundedValue = Math.ceil(value)
              return `${label ? label + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: { display: false }
        },
        scales: {
          x: { ticks: { font: { size: chartSize.ticksSize } } },
          y: { ticks: { font: { size: chartSize.ticksSize } } }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const chart = chartRef.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const colors = generateColors((data || []).length, canvas)
    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = colors.backgroundColors
    chart.data.datasets[0].borderColor = colors.borderColors

    chart.options.aspectRatio = ratio
    chart.options.plugins.tooltip.bodyFont.size = chartSize.tooltipBodySize
    chart.options.plugins.tooltip.titleFont.size = chartSize.tooltipFontSize
    chart.options.plugins.datalabels.font.size = chartSize.size

    chart.options.plugins.datalabels.color = context => {
      const c = context.chart
      const dataset = context.dataset
      const value = dataset.data[context.dataIndex]
      const chartHeight = c.scales.y.bottom - c.scales.y.top
      const maxValue = c.scales.y.max
      const barHeight = (value / maxValue) * chartHeight
      return barHeight >= 120 ? datalabelInsideColor : datalabelOutsideColor
    }

    chart.options.scales.x.ticks.font.size = chartSize.ticksSize
    chart.options.scales.y.ticks.font.size = chartSize.ticksSize

    chart.update('none')
  }, [labels, data, label, ratio, chartSize])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={canvasRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`} />
    </div>
  )
})

export const CompositeBarChart = memo(({ labels, data, label }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const getChart = useCallback(() => chartRef.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (chartRef.current) return

    const barBg = getCssVar(canvas, '--chart-primary-bar-bg')
    const barBorder = getCssVar(canvas, '--chart-primary-bar-border')

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: barBg,
            borderColor: barBorder,
            borderWidth: 1
          }
        ]
      },
      options: {
        ...getChartOptions(label, 'bar', canvas),
        responsive: true,
        maintainAspectRatio: false
      }
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const chart = chartRef.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const barBg = getCssVar(canvas, '--chart-primary-bar-bg')
    const barBorder = getCssVar(canvas, '--chart-primary-bar-border')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = barBg
    chart.data.datasets[0].borderColor = barBorder

    chart.options = {
      ...chart.options,
      ...getChartOptions(label, 'bar', canvas),
      responsive: true,
      maintainAspectRatio: false
    }

    chart.update('none')
  }, [labels, data, label])

  return <canvas ref={canvasRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`} />
})

export const LineChart = memo(({ id, labels, data, label }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  const getChart = useCallback(() => chartInstanceRef.current, [])
  useArgusTabActivatedResize(getChart)

  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (chartInstanceRef.current) return

    const lineColor = getCssVar(canvas, '--chart-line-1-color')
    const lineHoverColor = getCssVar(canvas, '--chart-line-1-hover')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            fill: false,
            borderColor: lineColor,
            backgroundColor: lineColor,
            hoverBackgroundColor: lineHoverColor,
            borderWidth: 1,
            tension: 0.1
          }
        ]
      },
      options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            max: Math.max(...(data || [0])) * 1.1,
            ticks: { font: { size: chartSize.ticksSize } }
          },
          y: {
            ticks: { font: { size: chartSize.ticksSize } }
          }
        },
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          },
          datalabels: {
            anchor: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? 'center' : 'right'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValue = chart.scales.x.max
              const barWidth = (value / maxValue) * chartWidth

              return barWidth >= 65 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            font: { size: 14 },
            formatter: value => value.toLocaleString()
          },
          legend: { display: false }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartInstanceRef.current?.destroy()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = chartRef.current
    const chart = chartInstanceRef.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const lineColor = getCssVar(canvas, '--chart-line-1-color')
    const lineHoverColor = getCssVar(canvas, '--chart-line-1-hover')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].borderColor = lineColor
    chart.data.datasets[0].backgroundColor = lineColor
    chart.data.datasets[0].hoverBackgroundColor = lineHoverColor

    chart.options.plugins.tooltip.bodyFont.size = chartSize.tooltipBodySize
    chart.options.plugins.tooltip.titleFont.size = chartSize.tooltipFontSize

    chart.options.scales.x.max = Math.max(...(data || [0])) * 1.1
    chart.options.scales.x.ticks.font.size = chartSize.ticksSize
    chart.options.scales.y.ticks.font.size = chartSize.ticksSize

    chart.options.plugins.datalabels.color = context => {
      const c = context.chart
      const dataset = context.dataset
      const value = dataset.data[context.dataIndex]
      const chartWidth = c.scales.x.right - c.scales.x.left
      const maxValue = c.scales.x.max
      const barWidth = (value / maxValue) * chartWidth
      return barWidth >= 65 ? datalabelInsideColor : datalabelOutsideColor
    }

    chart.update('none')
  }, [id, labels, data, label, chartSize])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={chartRef} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
    </div>
  )
})

export const LineChartDark = memo(({ labels, datasets, datasetLabels }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (inst.current) return

    inst.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'left',
            align: 'center',
            labels: {
              boxHeight: 14,
              padding: 12
            }
          }
        }
      }
    })

    return () => inst.current?.destroy()
  }, [])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(datasets)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    chart.data.labels = labels || []

    chart.data.datasets = (datasets || [])
      .map((d, i) => {
        if (!Array.isArray(d) || !d.some(v => v !== 0)) return null

        const color = getColorForIndex(i, canvas)

        return {
          label: datasetLabels?.[i] ?? `Year ${i + 1}`,
          data: d,
          borderColor: color,
          backgroundColor: color,
          tension: 0.3,
          pointRadius: 5,
          spanGaps: true
        }
      })
      .filter(Boolean)

    chart.update('none')
  }, [labels, datasets, datasetLabels])

  return (
    <div className={styles.chartHeight}>
      <canvas ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`} />
    </div>
  )
})

const getColorForIndex = (index, canvas) => {
  const colors = [
    getCssVar(canvas, '--chart-line-multi-1'),
    getCssVar(canvas, '--chart-line-multi-2'),
    getCssVar(canvas, '--chart-line-multi-3'),
    getCssVar(canvas, '--chart-line-multi-4'),
    getCssVar(canvas, '--chart-line-multi-5'),
    getCssVar(canvas, '--chart-line-multi-6')
  ]

  return colors[index % colors.length]
}

export const PieChart = memo(({ id, labels, data, label }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (inst.current) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    inst.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'pie', canvas)
    })

    return () => {
      inst.current?.destroy()
      inst.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = [c1, c2, c3, c4]
    chart.options = getChartOptions(label, 'pie', canvas)

    chart.update('none')
  }, [labels, data, label])

  return <canvas id={id} ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
})

export const DoughnutChart = memo(({ id, labels, data, label }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (inst.current) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    inst.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'doughnut', canvas)
    })

    return () => {
      inst.current?.destroy()
      inst.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = [c1, c2, c3, c4]
    chart.options = getChartOptions(label, 'doughnut', canvas)

    chart.update('none')
  }, [labels, data, label])

  return <canvas id={id} ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
})

export const RadarChart = memo(({ id, labels, data, label }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (inst.current) return

    const fill = getCssVar(canvas, '--chart-radar-fill')
    const border = getCssVar(canvas, '--chart-radar-border')
    const point = getCssVar(canvas, '--chart-radar-point')

    inst.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: fill,
            borderColor: border,
            pointBackgroundColor: point
          }
        ]
      },
      options: getChartOptions(label, 'radar', canvas)
    })

    return () => {
      inst.current?.destroy()
      inst.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const fill = getCssVar(canvas, '--chart-radar-fill')
    const border = getCssVar(canvas, '--chart-radar-border')
    const point = getCssVar(canvas, '--chart-radar-point')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = fill
    chart.data.datasets[0].borderColor = border
    chart.data.datasets[0].pointBackgroundColor = point
    chart.options = getChartOptions(label, 'radar', canvas)

    chart.update('none')
  }, [labels, data, label])

  return <canvas id={id} ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
})

export const PolarAreaChart = memo(({ id, labels, data, label }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (inst.current) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    inst.current = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels || [],
        datasets: [
          {
            label,
            data: data || [],
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'polarArea', canvas)
    })

    return () => {
      inst.current?.destroy()
      inst.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(data)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    chart.data.labels = labels || []
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = data || []
    chart.data.datasets[0].backgroundColor = [c1, c2, c3, c4]
    chart.options = getChartOptions(label, 'polarArea', canvas)

    chart.update('none')
  }, [labels, data, label])

  return <canvas id={id} ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
})

export const CompBarChart = memo(({ id, labels, datasets, collapsed }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  const getChart = useCallback(() => inst.current, [])
  useArgusTabActivatedResize(getChart)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    if (collapsed) {
      inst.current?.destroy()
      inst.current = null
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!inst.current) {
      const barBg = getCssVar(canvas, '--chart-compbar-bg')
      const barHoverBg = getCssVar(canvas, '--chart-compbar-hover-bg')
      const xTickColor = getCssVar(canvas, '--chart-compbar-axis-color')
      const yTickColor = xTickColor
      const gridColor = getCssVar(canvas, '--chart-compbar-grid-color')
      const datalabelColor = getCssVar(canvas, '--chart-datalabel-compbar-color')

      inst.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels || [],
          datasets: [
            {
              data: datasets || [],
              backgroundColor: barBg,
              hoverBackgroundColor: barHoverBg,
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: context => {
                const chart = context.chart
                const dataset = context.dataset
                const value = dataset.data[context.dataIndex]

                const chartHeight = chart.scales.y.bottom - chart.scales.y.top
                const maxValue = chart.scales.y.max
                const barHeight = (value / maxValue) * chartHeight

                return barHeight >= 120 ? 'center' : 'end'
              },
              align: context => {
                const chart = context.chart
                const dataset = context.dataset
                const value = dataset.data[context.dataIndex]

                const chartHeight = chart.scales.y.bottom - chart.scales.y.top
                const maxValue = chart.scales.y.max
                const barHeight = (value / maxValue) * chartHeight

                return barHeight >= 120 ? 'center' : 'end'
              },
              color: datalabelColor,
              offset: 0,
              rotation: -90,
              font: { size: 14, weight: 'bold' },
              formatter: val => val?.toLocaleString()
            }
          },
          scales: {
            x: {
              ticks: { color: xTickColor },
              grid: { display: true, color: gridColor }
            },
            y: {
              ticks: { color: yTickColor }
            }
          }
        },
        plugins: [ChartDataLabels]
      })
    }

    return () => {
      inst.current?.destroy()
      inst.current = null
    }
  }, [collapsed])

  useEffect(() => {
    const canvas = ref.current
    const chart = inst.current
    if (!canvas || !chart) return
    if (collapsed) return

    const nextHasMeaningful = hasAnyLabel(labels) && hasAnyValue(datasets)
    if (!nextHasMeaningful && chartHasAnyValue(chart)) return

    const barBg = getCssVar(canvas, '--chart-compbar-bg')
    const barHoverBg = getCssVar(canvas, '--chart-compbar-hover-bg')
    const xTickColor = getCssVar(canvas, '--chart-compbar-axis-color')
    const yTickColor = xTickColor
    const gridColor = getCssVar(canvas, '--chart-compbar-grid-color')
    const datalabelColor = getCssVar(canvas, '--chart-datalabel-compbar-color')

    chart.data.labels = labels || []
    chart.data.datasets[0].data = datasets || []
    chart.data.datasets[0].backgroundColor = barBg
    chart.data.datasets[0].hoverBackgroundColor = barHoverBg

    chart.options.scales.x.ticks.color = xTickColor
    chart.options.scales.y.ticks.color = yTickColor
    chart.options.scales.x.grid.color = gridColor
    chart.options.plugins.datalabels.color = datalabelColor

    chart.update('none')
  }, [labels, datasets, collapsed])

  return (
    <div className={styles.chartHeight}>
      <canvas id={id} ref={ref} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
    </div>
  )
})
