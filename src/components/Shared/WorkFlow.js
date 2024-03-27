import React, { useEffect } from 'react'

const MyChartComponent = () => {
  useEffect(() => {
    const loadScript = (url, callback) => {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = url
      script.async = true
      script.onload = callback
      document.head.appendChild(script)
    }

    loadScript('https://cdn.amcharts.com/lib/5/index.js', () => {
      loadScript('https://cdn.amcharts.com/lib/5/flow.js', () => {
        loadScript('https://cdn.amcharts.com/lib/5/themes/Animated.js', () => {
          am5.ready(() => {
            const root = am5.Root.new('chartdiv')
            root.setThemes([am5themes_Animated.new(root)])

            const series = root.container.children.push(
              am5flow.Sankey.new(root, {
                sourceIdField: 'from',
                targetIdField: 'to',
                valueField: 'value',
                paddingRight: 50,
                nodeWidth: 100
              })
            )

            series.links.template.set('fill', am5.color('#A8C686'))
            series.links.template.set('strokeWidth', 5)
            series.links.template.set('fillOpacity', 0)
            series.links.template.set('strokeOpacity', 0.3)
            series.links.template.set('stroke', am5.color('#555'))
            series.links.template.set('hoverable', false)
            series.links.template.set('hoverOnFocus', false)
            series.links.template.set('isHover', false)

            series.nodes.nodes.template.setAll({
              draggable: false, // disables dragging
              toggleKey: 'none' // disables toggling
            })

            // series.nodes..template.setAll({
            //   fillOpacity: 0.5,
            //   stroke: am5.color(0x000000),
            //   strokeWidth: 1,
            //   cornerRadiusTL: 4,
            //   cornerRadiusTR: 4,
            //   cornerRadiusBL: 4,
            //   cornerRadiusBR: 4
            // });

            // // Customize nodes appearance
            // const nodesTemplate = series.nodes.template
            // nodesTemplate.set('width', 100)
            // nodesTemplate.set('height', 30)
            // nodesTemplate.set('fill', am5.color('#4CAF50'))
            // nodesTemplate.set('strokeWidth', 0)
            // nodesTemplate.set('draggable', false)
            // nodesTemplate.set('inert', true)
            // nodesTemplate.set('clickable', true)
            // nodesTemplate.set('locationX', 0)
            // nodesTemplate.set('nameLabel', 'bold')

            // series.nodes.template.setAll({
            //   width: 100, // Adjust node width
            //   height: 30, // Adjust node height
            //   fill: am5.color('#4CAF50'), // Green color for nodes
            //   strokeWidth: 0, // Remove border if not needed
            //   draggable: false,
            //   inert: true,
            //   clickable: false,
            //   locationX: 0,
            //   nameLabel: 'bold'
            // })

            series.data.setAll([
              { from: 'A', to: 'D', value: 10 },
              { from: 'B', to: 'D', value: 8 },
              { from: 'B', to: 'E', value: 4 },
              { from: 'C', to: 'E', value: 3 },
              { from: 'D', to: 'G', value: 5 },
              { from: 'D', to: 'I', value: 2 },
              { from: 'D', to: 'H', value: 3 },
              { from: 'E', to: 'H', value: 6 },
              { from: 'G', to: 'J', value: 5 },
              { from: 'I', to: 'J', value: 1 },
              { from: 'H', to: 'J', value: 9 }
            ])

            series.appear(1000, 100)
          })
        })
      })
    })
  }, [])

  return <div id='chartdiv' style={{ width: '100%', height: '500px' }} />
}

export default MyChartComponent
