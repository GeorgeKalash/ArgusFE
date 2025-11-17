import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import styles from './Charts.module.css'

const getCssVar = (el, name, fallback) => {
  if (!el) return fallback
  const value = getComputedStyle(el).getPropertyValue(name)
  
  return value?.trim() || fallback
}

const predefinedColors = canvas => [
  getCssVar(canvas, '--chart-mixed-1', 'rgba(88, 2, 1)'),
  getCssVar(canvas, '--chart-mixed-2', 'rgba(67, 67, 72)'),
  getCssVar(canvas, '--chart-mixed-3', 'rgba(144, 237, 125)'),
  getCssVar(canvas, '--chart-mixed-4', 'rgba(247, 163, 92)'),
  getCssVar(canvas, '--chart-mixed-5', 'rgba(54, 162, 235)'),
  getCssVar(canvas, '--chart-mixed-6', 'rgba(153, 102, 255)'),
  getCssVar(canvas, '--chart-mixed-7', 'rgba(201, 203, 207)')
]

const generateColors = (dataLength, canvas) => {
  const palette = predefinedColors(canvas)
  const backgroundColors = []
  const borderColors = []

  for (let i = 0; i < dataLength; i++) {
    const color = palette[i % palette.length]
    backgroundColors.push(color)
    borderColors.push(color.replace('rgba', 'rgb'))
  }

  return { backgroundColors, borderColors }
}

const getChartOptions = (label, type, canvas) => {
  const legendLabelColor = getCssVar(canvas, '--chart-legend-label-color', '#f0f0f0')
  const titleColor = getCssVar(canvas, '--chart-title-color', '#f0f0f0')
  const axisColor = getCssVar(canvas, '--chart-axis-color', '#f0f0f0')

  const tooltipBg = getCssVar(canvas, '--chart-tooltip-bg', '#f0f0f0')
  const tooltipTitleColor = getCssVar(canvas, '--chart-tooltip-title-color', '#231F20')
  const tooltipBodyColor = getCssVar(canvas, '--chart-tooltip-body-color', '#231F20')

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
          color: axisColor
        },
        grid: {
          display: false
        }
      },
      x: {
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

export const MixedBarChart = ({ id, labels, data1, data2, label1, label2, ratio = 3, rotation, hasLegend }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const bar1Bg = getCssVar(canvas, '--chart-bar-1-bg', 'rgb(88, 2, 1)')
    const bar1HoverBg = getCssVar(canvas, '--chart-bar-1-hover-bg', 'rgb(113, 27, 26)')
    const bar2Bg = getCssVar(canvas, '--chart-bar-2-bg', 'rgb(5, 28, 104)')
    const bar2HoverBg = getCssVar(canvas, '--chart-bar-2-hover-bg', 'rgb(33, 58, 141)')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color', '#fff')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color', '#000')

    const chart = new Chart(ctx, {
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
        aspectRatio: ratio,
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
            rotation: rotation || 0,
            font: {
              size: 14
            },
            formatter: (value, context) => {
              const datasetIndex = context.datasetIndex
              const lbl = datasetIndex === 0 ? label1 : label2
              const roundedValue = Math.ceil(value)

              if (hasLegend) {
                return `${roundedValue.toLocaleString()}`
              }

              return `${lbl ? lbl + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: hasLegend || false
          }
        },

        scales: {
          y: {
            ticks: {
              callback: function (value) {
                if (value >= 1e6) {
                  return `${(value / 1e6).toFixed(1)}M`
                } else if (value >= 1e3) {
                  return `${(value / 1e3).toFixed(1)}K`
                }

                return value
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data1, data2, label1, label2, rotation])

  return (
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      style={{ width: '100%', height: '300px', position: 'relative' }}
    ></canvas>
  )
}

export const HorizontalBarChartDark = ({ id, labels, data, label, color, hoverColor }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg', 'rgb(88, 2, 1)')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg', 'rgb(113, 27, 26)')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color', '#fff')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color', '#000')

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
        responsive: false,
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

    return () => {
      chartInstanceRef.current.destroy()
    }
  }, [id, labels, data, label, color, hoverColor])

  const baseHeight = 200
  const barHeight = 25
  const dynamicHeight = baseHeight + labels.length * barHeight

  return (
    <canvas
      id={id}
      ref={chartRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      height={dynamicHeight}
      width={window.innerWidth / 2.5}
    ></canvas>
  )
}

export const CompositeBarChartDark = ({ id, labels, data, label, color, hoverColor, ratio = 3 }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg', 'rgb(88, 2, 1)')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg', 'rgb(113, 27, 26)')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color', '#fff')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color', '#000')

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
            rotation: -90,
            font: {
              size: 14
            },
            formatter: value => value.toLocaleString()
          },
          legend: {
            display: false
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return (
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      style={{ width: '100%', height: '300px', position: 'relative' }}
    ></canvas>
  )
}

export const MixedColorsBarChartDark = ({ id, labels, data, label, ratio = 3 }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const colors = generateColors(data.length, canvas)

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color', '#fff')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color', '#000')

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
              const dataset = context.dataset
              const lbl = dataset.label || ''

              const roundedValue = Math.ceil(value)

              return `${lbl}:\n${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return (
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      style={{ width: '100%', height: '300px', position: 'relative' }}
    ></canvas>
  )
}

export const CompositeBarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = getCssVar(canvas, '--chart-primary-bar-bg', '#6673FD')
    const barBorder = getCssVar(canvas, '--chart-primary-bar-border', '#6673FD')

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
      options: getChartOptions(label, 'bar', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
}

export const LineChart = ({ id, labels, data, label }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const lineColor = getCssVar(canvas, '--chart-line-1-color', 'rgb(102, 115, 253)')
    const lineHoverColor = getCssVar(canvas, '--chart-line-1-hover', 'rgb(126, 135, 243)')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color', '#fff')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color', '#000')

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
            tension: 0.1
          }
        ]
      },
      options: {
        indexAxis: 'x',
        responsive: false,
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
            formatter: value => value.toLocaleString()
          },
          legend: {
            display: false
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chartInstanceRef.current.destroy()
    }
  }, [id, labels, data, label])

  const baseHeight = 200
  const barHeight = 25
  const dynamicHeight = baseHeight + labels.length * barHeight

  return (
    <canvas
      id={id}
      ref={chartRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      height={dynamicHeight}
      width={window.innerWidth / 2.5}
    ></canvas>
  )
}

export const LineChartDark = ({ id, labels, datasets, datasetLabels }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const datasetConfig = datasets
      .map((data, index) => {
        if (data.length === 0) return null

        const color = getColorForIndex(index, canvas)
        const label = datasetLabels && datasetLabels[index] ? datasetLabels[index] : ``

        return {
          label,
          data,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: 5,
          tension: 0.2
        }
      })
      .filter(Boolean)

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasetConfig
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: datasetConfig.length > 0,
            position: 'left'
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

    return () => {
      chart.destroy()
    }
  }, [id, labels, datasets, datasetLabels])

  return <canvas id={id} className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}></canvas>
}

const getColorForIndex = (index, canvas) => {
  const palette = [
    getCssVar(canvas, '--chart-line-multi-1', '#808000'),
    getCssVar(canvas, '--chart-line-multi-2', '#1F3BB3'),
    getCssVar(canvas, '--chart-line-multi-3', '#00FF00'),
    getCssVar(canvas, '--chart-line-multi-4', '#FF5733'),
    getCssVar(canvas, '--chart-line-multi-5', '#FFC300'),
    getCssVar(canvas, '--chart-line-multi-6', '#800080')
  ]

  return palette[index % palette.length]
}

export const PieChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const c1 = getCssVar(canvas, '--chart-pie-1', '#6673FD')
    const c2 = getCssVar(canvas, '--chart-pie-2', '#FF6384')
    const c3 = getCssVar(canvas, '--chart-pie-3', '#36A2EB')
    const c4 = getCssVar(canvas, '--chart-pie-4', '#FFCE56')

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

    const c1 = getCssVar(canvas, '--chart-pie-1', '#6673FD')
    const c2 = getCssVar(canvas, '--chart-pie-2', '#FF6384')
    const c3 = getCssVar(canvas, '--chart-pie-3', '#36A2EB')
    const c4 = getCssVar(canvas, '--chart-pie-4', '#FFCE56')

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

    const fill = getCssVar(canvas, '--chart-radar-fill', 'rgba(102, 115, 253, 0.2)')
    const border = getCssVar(canvas, '--chart-radar-border', '#6673FD')
    const point = getCssVar(canvas, '--chart-radar-point', '#6673FD')

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

    const c1 = getCssVar(canvas, '--chart-pie-1', '#6673FD')
    const c2 = getCssVar(canvas, '--chart-pie-2', '#FF6384')
    const c3 = getCssVar(canvas, '--chart-pie-3', '#36A2EB')
    const c4 = getCssVar(canvas, '--chart-pie-4', '#FFCE56')

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

export const CompBarChart = ({ id, labels, datasets, collapsed }) => {
  useEffect(() => {
    if (!collapsed) {
      const canvas = document.getElementById(id)
      if (!canvas) return
      const ctx = canvas.getContext('2d')

      const barBg = getCssVar(canvas, '--chart-compbar-bg', 'rgba(0, 123, 255, 0.5)')
      const barHoverBg = getCssVar(canvas, '--chart-compbar-hover-bg', 'rgb(255, 255, 0)')
      const xTickColor = getCssVar(canvas, '--chart-compbar-axis-color', '#000')
      const yTickColor = xTickColor
      const gridColor = getCssVar(canvas, '--chart-compbar-grid-color', 'rgba(255, 255, 255, 0.2)')
      const datalabelColor = getCssVar(canvas, '--chart-datalabel-compbar-color', 'black')

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
              ticks: {
                color: xTickColor
              },
              grid: {
                display: true,
                color: gridColor
              }
            },
            y: {
              ticks: {
                color: yTickColor
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      })

      return () => {
        chart.destroy()
      }
    }
  }, [labels, datasets, collapsed])

  return (
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      style={{ height: '350px', width: '100%' }}
    ></canvas>
  )
}
