import { useContext, useState, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const MetalSummary = ({ handleMetalClick, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.Metals, window })

  async function fetchGridData() {
    let filteredItems = await handleMetalClick()

    getRequest({
      extension: InventoryRepository.Metals.qry,
      parameters: ``
    }).then(res => {
      const metalsStoreList = res.list

      const updatedData = filteredItems?.map(item => {
        const matchedMetal = metalsStoreList.find(metalStoreItem => item.metalId === metalStoreItem.recordId)

        if (matchedMetal) {
          return { ...item, metalRef: matchedMetal.reference }
        }

        return item
      })

      const viewedList = processMetalsList(updatedData)

      const transformedData = {
        count: viewedList.length,
        list: viewedList
      }

      setGridData(transformedData)
    })
  }

  const processMetalsList = metalsList => {
    const updatedList = metalsList?.map(line => {
      let updatedLine = { ...line }
      if (line.priceType === 1) {
        updatedLine.weight = line.qty
      } else if (line.priceType === 2) {
        updatedLine.weight = line.qty * line.weight
      }

      return updatedLine
    })

    const groupedMetals = updatedList?.reduce((acc, item) => {
      acc[item.metalId] = acc[item.metalId] || []
      acc[item.metalId].push(item)

      return acc
    }, {})

    const groups = Object?.values(groupedMetals).map(group => {
      const totalQty = group.reduce((sum, item) => sum + item.qty, 0)
      const totalWeight = group.filter(item => item.qty > 0).reduce((sum, item) => sum + item.weight, 0)

      const firstItem = { ...group[0], qty: totalQty, weight: totalWeight }

      return [firstItem, ...group.slice(1)]
    })

    const distinctMetalsArr = groups.map(group => group[0])

    return distinctMetalsArr
  }

  useEffect(() => {
    fetchGridData()
  }, [])

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.FE_MetalSummaryControl
  })

  const columns = [
    {
      field: 'metalRef',
      headerName: labels.metals,
      flex: 1
    },
    {
      field: 'qty',
      type: {
        field: 'number',
        decimal: 2,
        round: true
      },
      headerName: labels.qty,
      flex: 1
    },
    {
      field: 'metalPurity',
      type: {
        field: 'number',
        decimal: 2,
        round: true
      },
      headerName: labels.purity,
      flex: 1
    },
    {
      field: 'weight',
      type: {
        field: 'number',
        decimal: 2,
        round: true
      },
      headerName: labels.weight,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['metalRef']}
          isLoading={!gridData}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

MetalSummary.width = 600
MetalSummary.height = 550

export default MetalSummary
