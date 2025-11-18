import React, { useEffect, useMemo, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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

const generateColors = dataLength => {
  const backgroundColors = []
  const borderColors = []

  for (let i = 0; i < dataLength; i++) {
    const color = predefinedColors[i % predefinedColors.length]
    backgroundColors.push(color)
    borderColors.push(color.replace('rgba', 'rgb'))
  }

  return { backgroundColors, borderColors }
}

const getChartOptions = (label, type) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f0f0f0'
        }
      },
      title: {
        display: true,
        text: label,
        font: {
          size: 20,
          weight: 'bold'
        },
        color: '#f0f0f0'
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}`
          }
        },
        backgroundColor: '#f0f0f0',
        titleColor: '#231F20',
        bodyColor: '#231F20'
      }
    }
  }

  if (type === 'pie' || type === 'doughnut' || type === 'polarArea' || type === 'radar') {
    return {
      ...baseOptions,
      scales: {
        r: {
          pointLabels: {
            color: '#f0f0f0'
          },
          grid: {
            color: '#f0f0f0'
          },
          angleLines: {
            color: '#f0f0f0'
          }
        }
      }
    }
  }

  return {
    ...baseOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#f0f0f0'
        },
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          color: '#f0f0f0'
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
            backgroundColor: 'rgb(88, 2, 1)',
            hoverBackgroundColor: 'rgb(113, 27, 26)'
          },
          {
            label: label2 || null,
            data: data2,
            backgroundColor: 'rgb(5, 28, 104)',
            hoverBackgroundColor: 'rgb(33, 58, 141)'
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

    const ctx = chartRef.current.getContext('2d')

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: color || 'rgb(88, 2, 1)',
            hoverBackgroundColor: hoverColor || 'rgb(113, 27, 26)',
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

              return barWidth >= 65 ? '#fff' : '#000'
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

  const baseHeight = 200
  const barHeight = 25
  const dynamicHeight = baseHeight + labels.length * barHeight

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: dynamicHeight
      }}
    >
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
            backgroundColor: color || 'rgb(88, 2, 1)',
            hoverBackgroundColor: hoverColor || 'rgb(113, 27, 26)',
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

              return barHeight >= 120 ? '#fff' : '#000'
            },
            offset: 0,
            font: {
              size: 14
            },
            formatter: (value, context) => {
              const dataset = context.dataset
              const label = dataset.label || ''

              const roundedValue = Math.ceil(value)

              return `${label}:\n${roundedValue.toLocaleString()}`
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
            backgroundColor: '#6673FD',
            borderColor: '#6673FD',
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
            enabled: true,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: value => value.toLocaleString()
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

const getColorForIndex = index => {
  const colors = ['#808000', '#1F3BB3', '#00FF00', '#FF5733', '#FFC300', '#800080']

  return colors[index % colors.length]
}

export const PieChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['#6673FD', '#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      },
      options: getChartOptions(label, 'pie')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}

export const DoughnutChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['#6673FD', '#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      },
      options: getChartOptions(label, 'doughnut')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}

export const RadarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: 'rgba(102, 115, 253, 0.2)',
            borderColor: '#6673FD',
            pointBackgroundColor: '#6673FD'
          }
        ]
      },
      options: getChartOptions(label, 'radar')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}

export const PolarAreaChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['#6673FD', '#FF6384', '#36A2EB', '#FFCE56']
          }
        ]
      },
      options: getChartOptions(label, 'polarArea')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
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
