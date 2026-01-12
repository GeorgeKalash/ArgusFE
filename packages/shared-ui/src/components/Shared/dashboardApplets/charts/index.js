import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
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

// ---- DEFAULT THEME (replaces your CSS variables) ----
const defaultTheme = {
  '--chart-bar-1-bg': 'rgb(88, 2, 1)',
  '--chart-bar-1-hover-bg': 'rgb(113, 27, 26)',
  '--chart-bar-2-bg': 'rgb(5, 28, 104)',
  '--chart-bar-2-hover-bg': 'rgb(33, 58, 141)',

  '--chart-primary-bar-bg': '#6673FD',
  '--chart-primary-bar-border': '#6673FD',

  '--chart-mixed-1': 'rgba(88, 2, 1, 1)',
  '--chart-mixed-2': 'rgba(67, 67, 72, 1)',
  '--chart-mixed-3': 'rgba(144, 237, 125, 1)',
  '--chart-mixed-4': 'rgba(247, 163, 92, 1)',
  '--chart-mixed-5': 'rgba(54, 162, 235, 1)',
  '--chart-mixed-6': 'rgba(153, 102, 255, 1)',
  '--chart-mixed-7': 'rgba(201, 203, 207, 1)',

  '--chart-line-1-color': 'rgb(102, 115, 253)',
  '--chart-line-1-hover': 'rgb(126, 135, 243)',

  '--chart-line-multi-1': '#808000',
  '--chart-line-multi-2': '#1F3BB3',
  '--chart-line-multi-3': '#00FF00',
  '--chart-line-multi-4': '#FF5733',
  '--chart-line-multi-5': '#FFC300',
  '--chart-line-multi-6': '#800080',

  '--chart-radar-fill': 'rgba(102, 115, 253, 0.2)',
  '--chart-radar-border': '#6673FD',
  '--chart-radar-point': '#6673FD',

  '--chart-pie-1': '#6673FD',
  '--chart-pie-2': '#FF6384',
  '--chart-pie-3': '#36A2EB',
  '--chart-pie-4': '#FFCE56',

  '--chart-compbar-bg': 'rgba(0, 123, 255, 0.5)',
  '--chart-compbar-hover-bg': 'rgb(255, 255, 0)',
  '--chart-compbar-axis-color': '#000000',
  '--chart-compbar-grid-color': 'rgba(255, 255, 255, 0.2)',
  '--chart-datalabel-compbar-color': 'black',

  '--chart-legend-label-color': '#f0f0f0',
  '--chart-title-color': '#f0f0f0',
  '--chart-axis-color': '#f0f0f0',

  '--chart-datalabel-inside-color': '#fff',
  '--chart-datalabel-outside-color': '#000',

  '--chart-tooltip-bg': '#f0f0f0',
  '--chart-tooltip-title-color': '#231F20',
  '--chart-tooltip-body-color': '#231F20',

  '--chart-title-size': '16px'
}

const getCssVar = (el, name, fallback) => {
  // still supports CSS vars if you have them globally,
  // but now has strong JS defaults (no CSS file needed)
  const safeFallback = fallback ?? defaultTheme[name]
  if (!el) return safeFallback
  const value = getComputedStyle(el).getPropertyValue(name)
  return value?.trim() || safeFallback
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

const getChartOptions = (label, type, canvas, chartSize) => {
  const legendLabelColor = getCssVar(canvas, '--chart-legend-label-color')
  const titleColor = getCssVar(canvas, '--chart-title-color')
  const axisColor = getCssVar(canvas, '--chart-axis-color')

  const tooltipBg = getCssVar(canvas, '--chart-tooltip-bg')
  const tooltipTitleColor = getCssVar(canvas, '--chart-tooltip-title-color')
  const tooltipBodyColor = getCssVar(canvas, '--chart-tooltip-body-color')
  const titleSize = parseFloat(getCssVar(canvas, '--chart-title-size', '16px'))

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: legendLabelColor,
          font: { size: chartSize?.ticksSize ?? 10 }
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
        bodyColor: tooltipBodyColor,
        bodyFont: { size: chartSize?.tooltipBodySize ?? 10 },
        titleFont: { size: chartSize?.tooltipFontSize ?? 10 }
      }
    }
  }

  if (
    type === 'pie' ||
    type === 'doughnut' ||
    type === 'polarArea' ||
    type === 'radar'
  ) {
    return {
      ...baseOptions,
      scales: {
        r: {
          pointLabels: { color: axisColor },
          grid: { color: axisColor },
          angleLines: { color: axisColor },
          ticks: {
            backdropColor: 'transparent',
            color: axisColor,
            font: { size: chartSize?.ticksSize ?? 10 }
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
          color: axisColor,
          font: { size: chartSize?.ticksSize ?? 10 }
        },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: axisColor,
          font: { size: chartSize?.ticksSize ?? 10 }
        },
        grid: { display: false }
      }
    }
  }
}

// ---- INLINE SIZING (replaces your media queries + .chartHeight/.chartCanvas) ----
const getChartHeight = () => {
  // "clamp(220px, 30vw, 420px)" fallback if we can't read viewport
  if (typeof window === 'undefined') return 280

  const w = window.innerWidth
  const isLandscape =
    window.matchMedia?.('(orientation: landscape)')?.matches ?? false

  // mirrors your CSS behavior as close as possible
  if (w >= 1281) return 280
  if (w >= 1025 && w <= 1280) return 230
  if (w >= 769 && w <= 1024) return 210
  if (w >= 481 && w <= 768) return 240
  if (w <= 480) {
    // clamp(180px, 60vw, 300px)
    const v = Math.round(0.6 * w)
    return Math.min(300, Math.max(180, v))
  }
  if (w <= 1024 && isLandscape) {
    // clamp(180px, 40vh, 320px)
    const v = Math.round(0.4 * window.innerHeight)
    return Math.min(320, Math.max(180, v))
  }

  // clamp(220px, 30vw, 420px)
  const v = Math.round(0.3 * w)
  return Math.min(420, Math.max(220, v))
}

const getContainerStyle = () => ({
  width: '100%',
  display: 'block',
  position: 'relative',
  height: `${getChartHeight()}px`
})

const getCanvasStyle = () => ({
  width: '100%',
  height: '100%',
  display: 'block'
})

// -------------------- CHARTS --------------------

export const MixedBarChart = ({
  id,
  labels,
  data1,
  data2,
  label1,
  label2,
  ratio = 3,
  rotation,
  hasLegend
}) => {
  const canvasRef = useRef(null)

  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: label1 || null,
            data: data1,
            backgroundColor: getCssVar(canvas, '--chart-bar-1-bg'),
            hoverBackgroundColor: getCssVar(canvas, '--chart-bar-1-hover-bg')
          },
          {
            label: label2 || null,
            data: data2,
            backgroundColor: getCssVar(canvas, '--chart-bar-2-bg'),
            hoverBackgroundColor: getCssVar(canvas, '--chart-bar-2-hover-bg')
          }
        ]
      },
      options: {
        ...getChartOptions('', 'bar', canvas, chartSize),
        plugins: {
          ...getChartOptions('', 'bar', canvas, chartSize).plugins,
          legend: {
            display: hasLegend ?? true,
            labels: {
              color: getCssVar(canvas, '--chart-legend-label-color'),
              font: { size: chartSize.ticksSize }
            }
          },
          title: { display: false },
          tooltip: {
            ...getChartOptions('', 'bar', canvas, chartSize).plugins.tooltip,
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize }
          }
        }
      }
    })

    return () => {
      chart.destroy()
    }
  }, [labels, data1, data2, label1, label2, chartSize, hasLegend])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} ref={canvasRef} style={getCanvasStyle()} />
    </div>
  )
}

export const HorizontalBarChartDark = ({
  id,
  labels,
  data,
  label,
  color,
  hoverColor
}) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(
      canvas,
      '--chart-datalabel-inside-color'
    )
    const datalabelOutsideColor = getCssVar(
      canvas,
      '--chart-datalabel-outside-color'
    )

    const maxValue = Math.max(...(data || [0]))
    const xMax = maxValue > 0 ? maxValue * 1.1 : 1

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
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
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

              return barWidth >= 65 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

              return barWidth >= 65 ? 'center' : 'right'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

              return barWidth >= 65 ? datalabelInsideColor : datalabelOutsideColor
            },
            offset: 0,
            font: { size: chartSize.size },
            formatter: value => `${Math.ceil(value).toLocaleString()}`
          },
          legend: { display: false }
        },
        scales: {
          x: {
            max: xMax,
            ticks: { font: { size: chartSize.ticksSize } },
            grid: { display: false }
          },
          y: {
            ticks: { font: { size: chartSize.ticksSize } },
            grid: { display: false }
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartInstanceRef.current?.destroy()
    }
  }, [id, labels, data, label, color, hoverColor, chartSize])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} ref={chartRef} style={getCanvasStyle()} />
    </div>
  )
}

export const CompositeBarChartDark = ({
  id,
  labels,
  data,
  label,
  color,
  hoverColor,
  ratio = 3
}) => {
  const canvasRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize =
    width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(
      canvas,
      '--chart-datalabel-inside-color'
    )
    const datalabelOutsideColor = getCssVar(
      canvas,
      '--chart-datalabel-outside-color'
    )

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
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
          x: { ticks: { font: { size: chartSize.ticksSize } }, grid: { display: false } },
          y: { ticks: { font: { size: chartSize.ticksSize } }, grid: { display: false } }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => chart.destroy()
  }, [labels, data, label, color, hoverColor, ratio, chartSize])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} ref={canvasRef} style={getCanvasStyle()} />
    </div>
  )
}

export const MixedColorsBarChartDark = ({ id, labels, data, label, ratio = 3 }) => {
  const canvasRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize =
    width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const colors = generateColors(data.length, canvas)

    const datalabelInsideColor = getCssVar(
      canvas,
      '--chart-datalabel-inside-color'
    )
    const datalabelOutsideColor = getCssVar(
      canvas,
      '--chart-datalabel-outside-color'
    )

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
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
            formatter: value => {
              const roundedValue = Math.ceil(value)
              return `${label ? label + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: { display: false }
        },
        scales: {
          x: { ticks: { font: { size: chartSize.ticksSize } }, grid: { display: false } },
          y: { ticks: { font: { size: chartSize.ticksSize } }, grid: { display: false } }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => chart.destroy()
  }, [labels, data, label, ratio, chartSize])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} ref={canvasRef} style={getCanvasStyle()} />
    </div>
  )
}

export const CompositeBarChart = ({ labels, data, label }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')

    const barBg = getCssVar(canvasRef.current, '--chart-primary-bar-bg')
    const barBorder = getCssVar(canvasRef.current, '--chart-primary-bar-border')

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: barBg,
            borderColor: barBorder,
            borderWidth: 1
          }
        ]
      },
      options: {
        ...getChartOptions(label, 'bar', canvasRef.current, sizes[1280]),
        responsive: true,
        maintainAspectRatio: false
      }
    })

    return () => chart.destroy()
  }, [labels, data, label])

  return (
    <div style={getContainerStyle()}>
      <canvas ref={canvasRef} style={getCanvasStyle()} />
    </div>
  )
}

export const LineChart = ({ id, labels, data, label }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize =
    width > 1280 ? sizes[1281] : width > 1024 ? sizes[1280] : sizes[1024]

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const lineColor = getCssVar(canvas, '--chart-line-1-color')
    const lineHoverColor = getCssVar(canvas, '--chart-line-1-hover')

    const datalabelInsideColor = getCssVar(
      canvas,
      '--chart-datalabel-inside-color'
    )
    const datalabelOutsideColor = getCssVar(
      canvas,
      '--chart-datalabel-outside-color'
    )

    const maxValue = Math.max(...(data || [0]))
    const ySuggestedMax = maxValue > 0 ? maxValue * 1.1 : 1

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            fill: false,
            borderColor: lineColor,
            backgroundColor: lineColor,
            hoverBackgroundColor: lineHoverColor,
            borderWidth: 1,
            tension: 0.1,
            pointRadius: 3
          }
        ]
      },
      options: {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { font: { size: chartSize.ticksSize } },
            grid: { display: false }
          },
          y: {
            suggestedMax: ySuggestedMax,
            ticks: { font: { size: chartSize.ticksSize } },
            grid: { display: false }
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
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

              return barWidth >= 65 ? 'center' : 'end'
            },
            align: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

              return barWidth >= 65 ? 'center' : 'right'
            },
            color: context => {
              const chart = context.chart
              const dataset = context.dataset
              const value = dataset.data[context.dataIndex]

              const chartWidth = chart.scales.x.right - chart.scales.x.left
              const maxValueLocal = chart.scales.x.max
              const barWidth = (value / maxValueLocal) * chartWidth

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

    return () => chartInstanceRef.current?.destroy()
  }, [id, labels, data, label, chartSize])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} ref={chartRef} style={getCanvasStyle()} />
    </div>
  )
}

export const LineChartDark = ({ labels, datasets, datasetLabels }) => {
  const ref = useRef(null)
  const inst = useRef(null)

  useEffect(() => {
    if (!ref.current || !labels.length || !datasets.length) return
    if (inst.current) inst.current.destroy()

    const canvas = ref.current

    inst.current = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: datasets
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
              padding: 12,
              color: getCssVar(canvas, '--chart-legend-label-color')
            }
          }
        },
        scales: {
          x: {
            ticks: { color: getCssVar(canvas, '--chart-axis-color') },
            grid: { display: false }
          },
          y: {
            ticks: { color: getCssVar(canvas, '--chart-axis-color') },
            grid: { display: false }
          }
        }
      }
    })

    return () => inst.current?.destroy()
  }, [labels, datasets, datasetLabels])

  return (
    <div style={getContainerStyle()}>
      <canvas ref={ref} style={getCanvasStyle()} />
    </div>
  )
}

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

export const PieChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'pie', canvas, sizes[1280])
    })

    return () => chart.destroy()
  }, [id, labels, data, label])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} style={getCanvasStyle()} />
    </div>
  )
}

export const DoughnutChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'doughnut', canvas, sizes[1280])
    })

    return () => chart.destroy()
  }, [id, labels, data, label])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} style={getCanvasStyle()} />
    </div>
  )
}

export const RadarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const fill = getCssVar(canvas, '--chart-radar-fill')
    const border = getCssVar(canvas, '--chart-radar-border')
    const point = getCssVar(canvas, '--chart-radar-point')

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: fill,
            borderColor: border,
            pointBackgroundColor: point
          }
        ]
      },
      options: getChartOptions(label, 'radar', canvas, sizes[1280])
    })

    return () => chart.destroy()
  }, [id, labels, data, label])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} style={getCanvasStyle()} />
    </div>
  )
}

export const PolarAreaChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const c1 = getCssVar(canvas, '--chart-pie-1')
    const c2 = getCssVar(canvas, '--chart-pie-2')
    const c3 = getCssVar(canvas, '--chart-pie-3')
    const c4 = getCssVar(canvas, '--chart-pie-4')

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: [c1, c2, c3, c4]
          }
        ]
      },
      options: getChartOptions(label, 'polarArea', canvas, sizes[1280])
    })

    return () => chart.destroy()
  }, [id, labels, data, label])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} style={getCanvasStyle()} />
    </div>
  )
}

export const CompBarChart = ({ id, labels, datasets, collapsed }) => {
  useEffect(() => {
    if (!collapsed) {
      const canvas = document.getElementById(id)
      if (!canvas) return
      const ctx = canvas.getContext('2d')

      const barBg = getCssVar(canvas, '--chart-compbar-bg')
      const barHoverBg = getCssVar(canvas, '--chart-compbar-hover-bg')
      const xTickColor = getCssVar(canvas, '--chart-compbar-axis-color')
      const yTickColor = xTickColor
      const gridColor = getCssVar(canvas, '--chart-compbar-grid-color')
      const datalabelColor = getCssVar(canvas, '--chart-datalabel-compbar-color')

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data: datasets,
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
              ticks: { color: yTickColor },
              grid: { display: false }
            }
          }
        },
        plugins: [ChartDataLabels]
      })

      return () => chart.destroy()
    }
  }, [labels, datasets, collapsed, id])

  return (
    <div style={getContainerStyle()}>
      <canvas id={id} style={getCanvasStyle()} />
    </div>
  )
}
