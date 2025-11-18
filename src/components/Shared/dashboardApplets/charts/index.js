import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import styles from './charts.module.css'

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

export const MixedBarChart = ({ id, labels, data1, data2, label1, label2, ratio = 3, rotation, hasLegend}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const bar1Bg = getCssVar(canvas, '--chart-bar-1-bg')
    const bar1HoverBg = getCssVar(canvas, '--chart-bar-1-hover-bg')
    const bar2Bg = getCssVar(canvas, '--chart-bar-2-bg')
    const bar2HoverBg = getCssVar(canvas, '--chart-bar-2-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

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
      chart.destroy()
    }
  }, [labels, data1, data2, label1, label2, rotation, hasLegend, ratio])

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    />
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

    return () => {
      chartInstanceRef.current.destroy()
    }
  }, [id, labels, data, label, color, hoverColor])

return (
  <div  className={ styles.charthight}>


    <canvas
      id={id}
      ref={chartRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    ></canvas>
    </div>
  )
}

export const CompositeBarChartDark = ({ id, labels, data, label, color, hoverColor, ratio = 3 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = color || getCssVar(canvas, '--chart-bar-1-bg')
    const barHoverBg = hoverColor || getCssVar(canvas, '--chart-bar-1-hover-bg')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

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
  }, [labels, data, label, color, hoverColor, ratio])

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    />
  )
}


export const MixedColorsBarChartDark = ({ id, labels, data, label, ratio = 3 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const colors = generateColors(data.length, canvas)

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

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
              const roundedValue = Math.ceil(value)
              
              return `${label ? label + ':\n' : ''}${roundedValue.toLocaleString()}`
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
  }, [labels, data, label, ratio])

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    />
  )
}

export const CompositeBarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const barBg = getCssVar(canvas, '--chart-primary-bar-bg')
    const barBorder = getCssVar(canvas, '--chart-primary-bar-border')

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

    const lineColor = getCssVar(canvas, '--chart-line-1-color')
    const lineHoverColor = getCssVar(canvas, '--chart-line-1-hover')

    const datalabelInsideColor = getCssVar(canvas, '--chart-datalabel-inside-color')
    const datalabelOutsideColor = getCssVar(canvas, '--chart-datalabel-outside-color')

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

  return (
    <div  className={ styles.charthight}>
    <canvas
      id={id}
      ref={chartRef}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    ></canvas>
    </div>
  )
}

export const LineChartDark = ({ id, labels, datasets, datasetLabels }) => {
  useEffect(() => {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const datasetConfig = datasets
      .map((data, index) => {
        const color = getColorForIndex(index, canvas)

        if (data.some(value => value !== 0)) {
          return {
            label: datasetLabels[index],
            data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 3,
            spanGaps: true
          }
        }

        return null
      })
      .filter(dataset => dataset !== null)

    if (datasetConfig.length === 0) {
      return
    }

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
            position: 'left',
            labels: {
              usePointStyle: true,
              padding: 10
            }
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

    return () => {
      chart.destroy()
    }
  }, [id, labels, datasets, datasetLabels])

  return (
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
      
    ></canvas>
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
      
    ></canvas>
  )
}
