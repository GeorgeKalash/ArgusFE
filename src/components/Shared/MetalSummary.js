import { useContext, useState, useEffect } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const MetalSummary = ({ filteredItems }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

  async function fetchGridData() {
    var parameters = ``
    getRequest({
      extension: InventoryRepository.Metals.qry,
      parameters: parameters
    }).then(res => {
      const metalsStoreList = res.list

      const updatedData = filteredItems.map(item => {
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
    // Update weight based on priceType
    const updatedList = metalsList.map(line => {
      let updatedLine = { ...line }
      if (line.priceType === 1) {
        updatedLine.weight = line.qty
      } else if (line.priceType === 2) {
        updatedLine.weight = line.qty * line.weight
      }

      return updatedLine
    })

    // Group by metalId
    const groupedMetals = updatedList.reduce((acc, item) => {
      acc[item.metalId] = acc[item.metalId] || []
      acc[item.metalId].push(item)

      return acc
    }, {})

    // Calculate total qty and weight for each group
    const groups = Object.values(groupedMetals).map(group => {
      const totalQty = group.reduce((sum, item) => sum + item.qty, 0)
      const totalWeight = group.filter(item => item.qty > 0).reduce((sum, item) => sum + item.weight, 0)

      // Update the first item of the group
      const firstItem = { ...group[0], qty: totalQty, weight: totalWeight }

      // Return updated group
      return [firstItem, ...group.slice(1)]
    })

    // Extract distinct metals (first item of each group)
    const distinctMetalsArr = groups.map(group => group[0])

    return distinctMetalsArr
  }

  useEffect(() => {
    fetchGridData()
  }, [filteredItems])

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
      headerName: labels.qty,
      flex: 1
    },
    {
      field: 'metalPurity',
      headerName: labels.purity,
      flex: 1
    },
    {
      field: 'weight',
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

export default MetalSummary
