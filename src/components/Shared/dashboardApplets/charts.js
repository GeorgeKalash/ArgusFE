import { useEffect } from 'react'
import Chart from 'chart.js/auto'

const getChartOptions = label => ({
  responsive: true,
  maintainAspectRatio: false,
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
  },
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
        size: 24,
        weight: 'bold'
      },
      color: '#6673FD'
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.raw}`
        }
      }
    }
  }
})

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
      options: getChartOptions(label)
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
      options: getChartOptions(label)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}
