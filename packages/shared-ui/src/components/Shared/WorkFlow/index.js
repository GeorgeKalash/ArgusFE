import React, { useContext, useEffect } from 'react'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'
import styles from '@argus/shared-ui/src/components/Shared/WorkFlow/WorkFlow.module.css'


const WorkFlow = ({ functionId, recordId, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { languageId } = useContext(AuthContext)
  const { platformLabels } = useContext(ControlContext)

  const id = recordId + '-' + functionId

  useSetWindow({ title: platformLabels.WorkFlow, window })

    const { width } = useWindowDimensions()

    const isSmall = width <= 1024
    const isMedium = width > 1024 && width <= 1280

    const fontSize = isSmall ? 10 : isMedium ? 12 : 14
    const nodeW = isSmall ? 75 : isMedium ? 85 : 95
    const nodeH = isSmall ? 15 : isMedium ? 20 : 25

  const getWorkFlowData = async () => {
    var parameters = `_functionId=${functionId}&_recordId=${recordId}`

    const result = await getRequest({
      extension: SaleRepository.WorkFlow.graph,
      parameters: parameters
    })

    return result?.record
  }

  const getDeptsJson = graph => {
    let result = []
    let result2 = []
    let parent = ''
    let child = ''
    let parentId = -1
    let childId = -1

    graph.objects.forEach(item => {
      result.push({ functionName: item.functionName, reference: item.reference, date: item.date })
    })

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
    ;(async function () {
      var data = await getWorkFlowData()
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
                const chart = am4core.create(id, am4charts.SankeyDiagram)
                const combinedData = getDeptsJson(data)
                chart.data = combinedData
                chart.dataFields.fromName = 'from'
                chart.dataFields.toName = 'to'
                chart.dataFields.value = 'value'
                chart.paddingRight = languageId === 2 ? 0 : 40
                chart.paddingLeft = languageId === 2 ? 40 : 0
                chart.tooltip.label.fontSize = fontSize

                const nodeTemplate = chart.nodes.template
                nodeTemplate.draggable = false
                nodeTemplate.inert = true
                nodeTemplate.clickable = false
             
                nodeTemplate.width = nodeW
                nodeTemplate.height = nodeH
                nodeTemplate.nameLabel.label.fontSize = fontSize

                nodeTemplate.nameLabel.locationX = languageId === 2 ? 0.85 : 0
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
    })()
  }, [])

  return (
   <div id={id}  className={styles.root}  />

  )
}

WorkFlow.width = 950

export default WorkFlow
