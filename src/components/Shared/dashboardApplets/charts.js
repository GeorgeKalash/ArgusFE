import { useEffect } from 'react'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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

export const HorizontalBarChartDark = ({ id, labels, data, label, color, hoverColor }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const globalMax = Math.max(...data, 1)

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data: data,
            backgroundColor: color || 'rgb(88, 2, 1)',
            hoverBackgroundColor: hoverColor || 'rgb(113, 27, 26)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
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
          }
        }
      },
      plugins: [ChartDataLabels]
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  const baseHeight = 200
  const barHeight = 25
  const dynamicHeight = baseHeight + labels.length * barHeight

  return <canvas id={id} style={{ width: '100%', height: `${dynamicHeight}px` }}></canvas>
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
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            fill: false,
            borderColor: '#6673FD',
            backgroundColor: '#6673FD',
            borderWidth: 1,
            tension: 0.1
          }
        ]
      },
      options: getChartOptions(label, 'line')
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
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
