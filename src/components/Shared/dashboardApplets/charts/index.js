import React, { useEffect, useMemo, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import styles from './charts.module.css'

Chart.register(ChartDataLabels)

const predefinedColors = [
  'rgba(88, 2, 1)',
  'rgba(67, 67, 72)',
  'rgba(144, 237, 125)',
  'rgba(247, 163, 92)',
  'rgba(54, 162, 235)',
  'rgba(153, 102, 255)',
  'rgba(201, 203, 207)'
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
          size: 20,
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

export const MixedBarChart = ({
  labels,
  data1,
  data2,
  label1,
  label2,
  rotation = 0,
  hasLegend = false,
  height = 320
}) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    chartRef.current?.destroy()

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: label1 || null,
            data: data1,
            backgroundColor: bar1Bg,
            hoverBackgroundColor: bar1HoverBg
          },
          {
            label: label2 || null,
            data: data2,
            backgroundColor: bar2Bg,
            hoverBackgroundColor: bar2HoverBg
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: ctx => {
              const ch = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? 'center' : 'end'
            },
            align: ctx => {
              const ch = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? 'center' : 'end'
            },
            color: ctx => {
              const ch = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? '#fff' : '#000'
            },
            offset: 0,
            rotation,
            font: { size: 14 },
            formatter: (value, ctx) => {
              const dsIndex = ctx.datasetIndex
              const lab = dsIndex === 0 ? label1 : label2
              const rounded = Math.ceil(value)
              if (hasLegend) return `${rounded.toLocaleString()}`

              return `${lab ? lab + ':\n' : ''}${rounded.toLocaleString()}`
            }
          },
          legend: { display: hasLegend }
        },
        scales: {
          y: {
            ticks: {
              callback: val => {
                if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`
                if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`

                return val
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    })
  }, [label1, label2, labels, data1, data2])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
    </div>
  )
}

export const HorizontalBarChartDark = ({ labels, data, label, color, hoverColor }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) return

    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

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
        scales: {
          x: {
            max: Math.max(...data) * 1.1
          }
        },
        plugins: {
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
            font: {
              size: 14
            },
            formatter: (value, context) => {
              const roundedValue = Math.ceil(value)

              return `${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        }
      },
      plugins: [ChartDataLabels]
    })
  }, [labels, data, label])

return (
  <div  className={ styles.charthight}>

      <canvas
        ref={chartRef}
        height={dynamicHeight}
        width={window.innerWidth / 2.5}
        style={{ position: 'absolute' }}
      ></canvas>
    </div>
  )
}

export const CompositeBarChartDark = ({ labels, data, label, color, hoverColor, height = 300 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')

    chartRef.current = new Chart(ctx, {
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
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            anchor: c => {
              const ch = c.chart
              const v = c.dataset.data[c.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? 'center' : 'end'
            },
            align: c => {
              const ch = c.chart
              const v = c.dataset.data[c.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? 'center' : 'end'
            },
            color: c => {
              const ch = c.chart
              const v = c.dataset.data[c.dataIndex]
              const h = ch.scales.y.bottom - ch.scales.y.top
              const max = ch.scales.y.max

              return (v / max) * h >= 120 ? '#fff' : '#000'
            },
            rotation: -90,
            font: { size: 14 },
            formatter: v => v.toLocaleString()
          },
          legend: { display: false }
        }
      },
      plugins: [ChartDataLabels]
    })
  }, [data, labels, label])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
    </div>
  )
}

export const MixedColorsBarChartDark = ({ labels = [], data = [], label, height = 300 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current || !canvasRef.current) return
    const colors = generateColors(data?.length || 0)

    const ctx = canvasRef.current.getContext('2d')

    chartRef.current = new Chart(ctx, {
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
        maintainAspectRatio: false,
        plugins: {
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
            font: {
              size: 14
            },
            formatter: (value, context) => {
              const datasetIndex = context.datasetIndex
              const lbl = label
              const roundedValue = Math.ceil(value)

              return `${lbl ? lbl + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        }
      },
      plugins: [ChartDataLabels]
    })
  }, [data, labels, label])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute' }}></canvas>
    </div>
  )
}

export const CompositeBarChart = ({ labels = [], data = [], label = '' }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')

    chartRef.current = new Chart(ctx, {
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
      }
    })

    return () => chartRef.current?.destroy()
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = chartRef.current

    chart.data.labels = [...labels]
    chart.data.datasets[0].label = label
    chart.data.datasets[0].data = [...data]
    chart.update()
  }, [labels, data, label])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export const LineChart = ({ labels, data, label, height = 450 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderWidth: 1,
            borderColor: 'rgb(102, 115, 253)',
            backgroundColor: 'rgb(102, 115, 253)',
            hoverBackgroundColor: 'rgb(126, 135, 243)',
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 0,
        layout: { padding: 0 },
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: ctx => {
              const chart = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const w = chart.scales.x.right - chart.scales.x.left
              const max = Math.max(...(data.length ? data : [1]))

              return (v / max) * w >= 65 ? 'center' : 'end'
            },
            align: ctx => {
              const chart = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const w = chart.scales.x.right - chart.scales.x.left
              const max = Math.max(...(data.length ? data : [1]))

              return (v / max) * w >= 65 ? 'center' : 'right'
            },
            color: ctx => {
              const chart = ctx.chart
              const v = ctx.dataset.data[ctx.dataIndex]
              const w = chart.scales.x.right - chart.scales.x.left
              const max = Math.max(...(data.length ? data : [1]))

              return (v / max) * w >= 65 ? '#fff' : '#000'
            },
            offset: 0,
            font: { size: 14 },
            formatter: v => Number(v).toLocaleString()
          }
        }
      }
    })
  }, [labels, data, label])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

export const LineChartDark = ({ labels = [], datasets = [], datasetLabels }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  const datasetConfig = useMemo(
    () =>
      datasets
        .map((data, index) => {
          if (!data?.length) return null
          const color = getColorForIndex(index)

          return {
            label: datasetLabels?.[index] ?? '',
            data,
            fill: false,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            pointRadius: 5,
            tension: 0.2
          }
        })
        .filter(Boolean),
    [datasets, datasetLabels]
  )

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: datasetConfig },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: datasetConfig.length > 0, position: 'left' },
          datalabels: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString()
              }
            }
          }
        }
      }
    })

    return () => chartRef.current?.destroy()
  }, [datasetConfig, labels])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.labels = [...labels]
    chartRef.current.data.datasets = datasetConfig
    chartRef.current.update()
  }, [labels, datasetConfig])

  return <canvas ref={canvasRef} />
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
      options: getChartOptions(label, 'pie', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
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
      options: getChartOptions(label, 'doughnut', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
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
      options: getChartOptions(label, 'radar', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
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
      options: getChartOptions(label, 'polarArea', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
}

export const CompBarChart = ({ labels = [], datasets = [], height = 350 }) => {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || chartRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: datasets,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            hoverBackgroundColor: 'rgb(255, 255, 0)',
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
            anchor: ctx => {
              const chart = ctx.chart
              const value = ctx.dataset.data[ctx.dataIndex]
              const y = chart.scales?.y
              if (!y || !isFinite(value)) return 'end'
              const chartHeight = y.bottom - y.top
              const maxValue = y.max || 1
              const barHeight = (value / maxValue) * chartHeight

              return barHeight >= 120 ? 'center' : 'end'
            },
            align: ctx => {
              const chart = ctx.chart
              const value = ctx.dataset.data[ctx.dataIndex]
              const y = chart.scales?.y
              if (!y || !isFinite(value)) return 'end'
              const chartHeight = y.bottom - y.top
              const maxValue = y.max || 1
              const barHeight = (value / maxValue) * chartHeight

              return barHeight >= 120 ? 'center' : 'end'
            },
            color: 'black',
            offset: 0,
            rotation: -90,
            font: { size: 14, weight: 'bold' },
            formatter: val => (val ?? '').toLocaleString?.() ?? val
          }
        },
        scales: {
          x: {
            ticks: { color: '#000' },
            grid: { display: true, color: 'rgba(255, 255, 255, 0.2)' }
          },
          y: {
            ticks: { color: '#000' }
          }
        }
      }
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    chart.data.labels = Array.isArray(labels) ? [...labels] : []

    if (Array.isArray(datasets) && !Array.isArray(datasets[0])) {
      if (!chart.data.datasets[0]) {
        chart.data.datasets = [
          {
            data: [],
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            hoverBackgroundColor: 'rgb(255, 255, 0)',
            borderWidth: 1
          }
        ]
      }
      chart.data.datasets[0].data = [...datasets]
    } else if (Array.isArray(datasets)) {
      chart.data.datasets = datasets.map(ds => ({ ...ds }))
    } else {
      chart.data.datasets = []
    }

    chart.update()
  }, [labels, datasets])

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
