import React, { useContext, useEffect } from 'react'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

const WorkFlow = ({ functionId, recordId }) => {
  const { getRequest } = useContext(RequestsContext)

  const getWorkFlowData = () => {
    var parameters = `_functionId=${functionId}&_recordId=${recordId}`
    getRequest({
      extension: SaleRepository.WorkFlow.graph,
      parameters: parameters
    }).then(res => {
      return res?.result
    })
  }

  const getDeptsJson = graph => {
    let result = []
    let result2 = []
    let parent = ''
    let child = ''
    let parentId = -1
    let childId = -1

    // Iterate over objects
    graph.objects.forEach(item => {
      result.push({ functionName: item.functionName, reference: item.reference, date: item.date })
    })

    // Iterate over workflow
    graph.workflow.forEach(item => {
      graph.objects.forEach(item2 => {
        let functionLines = item2.functionName.split(' ')
        let functionString = functionLines.join('\r\n')

        if (item.parentId === item2.recordId && item.parentFunctionId === item2.functionId) {
          parent = item2.reference + '\r\n' + item2.date + '\r\n' + functionString
          parentId = item.parentId
        }
        if (item.childId === item2.recordId && item.childFunctionId === item2.functionId) {
          child = item2.reference + '\r\n' + item2.date + '\r\n' + functionString
          childId = item.childId
        }
      })

      if (!(parent === '' || child === '')) {
        result2.push({ from: parent, to: child, value: 1, labelText: '' })
      }
      parent = ''
      child = ''
    })

    return result2
  }

  useEffect(() => {
    var data = getWorkFlowData()
    if (data) {
      const loadScript = (url, callback) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = url
        script.async = true
        script.onload = callback
        document.head.appendChild(script)
      }

      loadScript('https://cdn.amcharts.com/lib/4/core.js', () => {
        loadScript('https://cdn.amcharts.com/lib/4/charts.js', () => {
          loadScript('https://cdn.amcharts.com/lib/4/themes/animated.js', () => {
            am4core.ready(() => {
              const chart = am4core.create('chartdiv', am4charts.SankeyDiagram)
              const combinedData = getDeptsJson(data)
              chart.data = combinedData
              chart.dataFields.fromName = 'from'
              chart.dataFields.toName = 'to'
              chart.dataFields.value = 'value'
              chart.paddingRight = 40

              const nodeTemplate = chart.nodes.template
              nodeTemplate.draggable = false
              nodeTemplate.inert = true
              nodeTemplate.clickable = false
              nodeTemplate.width = 110
              nodeTemplate.height = 30

              nodeTemplate.nameLabel.locationX = 0
              nodeTemplate.nameLabel.height = undefined
              nodeTemplate.nameLabel.label.fontWeight = 'bold'
              const linkTemplate = chart.links.template
              linkTemplate.middleLine.strokeOpacity = 0.3
              linkTemplate.middleLine.stroke = am4core.color('#555')
              linkTemplate.middleLine.strokeWidth = 5
              linkTemplate.middleLine.hoverable = false
              linkTemplate.fillOpacity = 0
              linkTemplate.hoverable = true
              linkTemplate.hoverOnFocus = true
              linkTemplate.fill = am4core.color('#A8C686')
              linkTemplate.isHover = true

              chart.appear(1000, 100)
            })
          })
        })
      })
    }
  }, [])

  return <div id='chartdiv' style={{ width: '100%', height: '500px' }} />
}

export default WorkFlow
