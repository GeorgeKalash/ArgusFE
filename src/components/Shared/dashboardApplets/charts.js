import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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

export const MixedBarChart = ({ id, labels, data1, data2, label1, label2, ratio = 3, rotation, hasLegend }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
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

              return barHeight >= 120 ? '#fff' : '#000'
            },
            offset: 0,
            rotation: rotation || 0,
            font: {
              size: 14
            },
            formatter: (value, context) => {
              const datasetIndex = context.datasetIndex
              const label = datasetIndex === 0 ? label1 : label2
              const roundedValue = Math.ceil(value)

              if (hasLegend) {
                return `${roundedValue.toLocaleString()}`
              }

              return `${label ? label + ':\n' : ''}${roundedValue.toLocaleString()}`
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

  return <canvas id={id} style={{ width: '100%', height: '300px', position: 'relative' }}></canvas>
}

export const HorizontalBarChartDark = ({ id, labels, data, label, color, hoverColor }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

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

    return () => {
      chartInstanceRef.current.destroy()
    }
  }, [id, labels, data, label, color, hoverColor])

  const baseHeight = 200
  const barHeight = 25
  const dynamicHeight = baseHeight + labels.length * barHeight

  return <canvas id={id} ref={chartRef} height={dynamicHeight} width={window.innerWidth / 2.5}></canvas>
}

export const CompositeBarChartDark = ({ id, labels, data, label, color, hoverColor, ratio = 3 }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
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

              return barHeight >= 120 ? '#fff' : '#000'
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

  return <canvas id={id} style={{ width: '100%', height: '300px', position: 'relative' }}></canvas>
}

export const MixedColorsBarChartDark = ({ id, labels, data, label, ratio = 3 }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')
    const colors = generateColors(data.length)

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

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id} style={{ width: '100%', height: '300px', position: 'relative' }}></canvas>
}

export const CompositeBarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
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
      },
      options: getChartOptions(label, 'bar')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}

export const LineChart = ({ id, labels, data, label }) => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    const ctx = chartRef.current.getContext('2d')

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            fill: false,
            borderColor: 'rgb(102, 115, 253)',
            backgroundColor: 'rgb(102, 115, 253)',
            hoverBackgroundColor: 'rgb(126, 135, 243)',
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

              return barWidth >= 65 ? '#fff' : '#000'
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

  return <canvas id={id} ref={chartRef} height={dynamicHeight} width={window.innerWidth / 2.5}></canvas>
}

export const LineChartDark = ({ id, labels, datasets, datasetLabels }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const datasetConfig = datasets
      .map((data, index) => {
        if (data.length === 0) return null

        const color = getColorForIndex(index)
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

  return <canvas id={id}></canvas>
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

export const CompBarChart = ({ id, labels, datasets, collapsed }) => {
  useEffect(() => {
    if (!collapsed) {
      const ctx = document.getElementById(id).getContext('2d')

      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
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
              color: 'black',
              offset: 0,
              rotation: -90,
              font: { size: 14, weight: 'bold' },
              formatter: val => val?.toLocaleString()
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#000'
              },
              grid: {
                display: true,
                color: 'rgba(255, 255, 255, 0.2)'
              }
            },
            y: {
              ticks: {
                color: '#000'
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

  return <canvas id={id} style={{ height: '350px', width: '100%' }}></canvas>
}
