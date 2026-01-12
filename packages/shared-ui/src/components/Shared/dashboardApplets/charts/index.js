import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import styles from './charts.module.css'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

const sizes = {
1024 : {
 size : 10,
 tooltipBodySize :8,
 tooltipFontSize : 8,
 ticksSize :   8
},
1280 : {
 size :  10,
 tooltipBodySize :8,
 tooltipFontSize : 8,
 ticksSize :  9.1
},
1281 : {
  size :  12,
  tooltipBodySize :8,
  tooltipFontSize : 8,
  ticksSize :  9.8
 }
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

export const MixedBarChart = ({ id, labels, data1, data2, label1, label2, ratio = 3, rotation, hasLegend}) => {
  const canvasRef = useRef(null)

  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] :  sizes[1024]

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
            hoverBackgroundColor: getCssVar(canvas, '--chart-bar-1-hover-bg'),
          },
          {
            label: label2 || null,
            data: data2,
            backgroundColor: getCssVar(canvas, '--chart-bar-2-bg'),
            hoverBackgroundColor: getCssVar(canvas, '--chart-bar-2-hover-bg'),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: { size: chartSize.tooltipBodySize },
            titleFont: { size: chartSize.tooltipFontSize },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [labels, data1, data2, label1, label2, chartSize]);

  return (
    <div className={fall('chartHeight')}>
      {fallbackStylesTag}
      <canvas
        id={id}
        ref={canvasRef}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      />
    </div>
  )
}


export const HorizontalBarChartDark = ({ id, labels, data, label, color, hoverColor }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize = width >= 1280 ? sizes[1280] :  sizes[1024]

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
          tooltip: {
            bodyFont: {
              size: chartSize.tooltipBodySize,
            },
            titleFont: {
              size: chartSize.tooltipFontSize, 
            },
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
            font: {
              size: chartSize.size
            },
            formatter: (value, _) => {
              const roundedValue = Math.ceil(value)

              return `${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: chartSize.ticksSize, 
              },
            },
          },
          y: {
            ticks: {
              font: {
                size: chartSize.ticksSize,
              },
            },
          },
        },
        
      },
      
      plugins: [ChartDataLabels]
    })

    return () => {
      chartInstanceRef.current.destroy()
    }
  }, [id, labels, data, label, color, hoverColor])

return (
  <div className={fall('chartHeight')}>
    {fallbackStylesTag}

    <canvas
      id={id}
      ref={chartRef}
      className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
    ></canvas>
  </div>
  )
}

export const CompositeBarChartDark = ({ id, labels, data, label, color, hoverColor, ratio = 3 }) => {
  const canvasRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ?  sizes[1281]  : width > 1024  ?  sizes[1280] :  sizes[1024]

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
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: {
              size: chartSize.tooltipBodySize,
            },
            titleFont: {
              size: chartSize.tooltipFontSize, 
            },
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
            font: {
              size: chartSize.size
            },
            formatter: value => value.toLocaleString()
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: chartSize.ticksSize, 
              },
            },
          },
          y: {
            ticks: {
              font: {
                size: chartSize.ticksSize,
              },
            },
          },
        },
    
      },
      plugins: [ChartDataLabels]
    })



    return () => {
      chart.destroy()
    }
  }, [labels, data, label, color, hoverColor, ratio])

  return (
    <div className={fall('chartHeight')}>
      {fallbackStylesTag}
      <canvas
        id={id}
        ref={canvasRef}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      />
    </div>
  )
}


export const MixedColorsBarChartDark = ({ id, labels, data, label, ratio = 3 }) => {
  const canvasRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ?  sizes[1281]  : width > 1024  ?  sizes[1280] :  sizes[1024]

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
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            bodyFont: {
              size: chartSize.tooltipBodySize,
            },
            titleFont: {
              size: chartSize.tooltipFontSize, 
            },
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
            font: {
              size: chartSize.size, 
            },
            formatter: (value, context) => {
              const roundedValue = Math.ceil(value)
              
              return `${label ? label + ':\n' : ''}${roundedValue.toLocaleString()}`
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: chartSize.ticksSize, 
              },
            },
          },
          y: {
            ticks: {
              font: {
                size: chartSize.ticksSize,
              },
            },
          },
        },
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chart.destroy()
    }
  }, [labels, data, label, ratio])

  return (
    <div className={fall('chartHeight')}>
      {fallbackStylesTag}
      <canvas
        id={id}
        ref={canvasRef}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      />
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
        ...getChartOptions(label, 'bar', canvasRef.current),
        responsive: true,
        maintainAspectRatio: false
      }
    })

    return () => {
      chart.destroy()
    }
  }, [labels, data, label])

  return (
    <>
      {fallbackStylesTag}
      <canvas
        ref={canvasRef}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      />
    </>
  )
}

export const LineChart = ({ id, labels, data, label }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const { width } = useWindowDimensions()
  const chartSize = width > 1280 ?  sizes[1281]  : width > 1024  ?  sizes[1280] :  sizes[1024]

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
            max: Math.max(...data) * 1.1,
            ticks: {
              font: {
                size: chartSize.ticksSize, 
              },
            },
          },
          y: {
            ticks: {
              font: {
                size: chartSize.ticksSize,
              },
            },
          },
        },
        plugins: {
          tooltip: {
            bodyFont: {
              size: chartSize.tooltipBodySize,
            },
            titleFont: {
              size: chartSize.tooltipFontSize, 
            },
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
    <div className={fall('chartHeight')}>
      {fallbackStylesTag}
      <canvas
        id={id}
        ref={chartRef}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      ></canvas>
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
              padding: 12
            }
          }
        }
      }
    })

    return () => inst.current?.destroy()
  }, [labels, datasets, datasetLabels])

  return (
    <div className={fall('chartHeight')}>
      {fallbackStylesTag}
      <canvas
        ref={ref}
        className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}
      />
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
      options: getChartOptions(label, 'pie', canvas)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <>
    {fallbackStylesTag}
    <canvas id={id} className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}></canvas>
  </>
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

  return <>
    {fallbackStylesTag}
    <canvas id={id} className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}></canvas>
  </>
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

  return <>
    {fallbackStylesTag}
    <canvas id={id} className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}></canvas>
  </>
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

  return <>
    {fallbackStylesTag}
    <canvas id={id} className={`${fall('chartCanvas')} ${fall('chartCanvasDark')}`}></canvas>
  </>
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
    <div className={styles.chartHeight}>
    <canvas
      id={id}
      className={`${styles.chartCanvas} ${styles.chartCanvasDark}`}
    ></canvas>
    </div>
  )
}

// Fallback helper and inline defaults for slow CSS load
const fall = (name) => (styles && styles[name]) ? styles[name] : `dd-${name}`;

const fallbackStylesTag = (
  <style>{`
    .dd-chartHeight { height: 350px; }
    .dd-chartCanvas { width: 100%; height: 100%; display: block; }
    .dd-chartCanvasDark { background: transparent; }

    /* Default CSS variables used by charts when module CSS isn't loaded yet */
    .dd-chartCanvas {
      --chart-bar-1-bg: #6e87b6;
      --chart-bar-1-hover-bg: #5f76a3;
      --chart-bar-2-bg: #d5b552;
      --chart-bar-2-hover-bg: #c4a547;
      --chart-datalabel-inside-color: #ffffff;
      --chart-datalabel-outside-color: #222222;
      --chart-tooltip-bg: rgba(0,0,0,0.8);
      --chart-tooltip-title-color: #fff;
      --chart-tooltip-body-color: #fff;
      --chart-legend-label-color: #999;
      --chart-title-color: #222;
      --chart-axis-color: #666;
      --chart-pie-1: #4caf50;
      --chart-pie-2: #2196f3;
      --chart-pie-3: #ff9800;
      --chart-pie-4: #f44336;
      --chart-line-1-color: #6e87b6;
      --chart-line-1-hover: #5f76a3;
      --chart-primary-bar-bg: #6e87b6;
      --chart-primary-bar-border: #5f76a3;
      --chart-compbar-bg: #6e87b6;
      --chart-compbar-hover-bg: #5f76a3;
      --chart-compbar-axis-color: #666;
      --chart-compbar-grid-color: #eee;
      --chart-datalabel-compbar-color: #fff;
    }
  `}</style>
)