import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const LotForm = ({ labels, categoryId, itemId, maxAccess }) => {
  const { getRequest } = useContext(RequestsContext)

  const [data, setData] = useState([])

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.AvailabilityLot.qry,
      parameters: `_itemId=${itemId}&_siteId=0`
    })
    setData(response)
  }

  const [columns, setColumns] = useState([])

  async function getDynamicColumns() {
    const dynamicColumns = [
      {
        field: 'lotRef',
        headerName: labels.lotNumber,
        flex: 1
      },
      {
        field: 'onHand',
        headerName: labels.qtyOnHand,
        flex: 1,
        type: 'number'
      }
    ]

    if (categoryId) {
      const response = await getRequest({
        extension: InventoryRepository.LotCategory.get,
        parameters: `_recordId=${categoryId}`
      })

      if (response?.record?.udd1) {
        dynamicColumns.push({
          field: 'udd1',
          headerName: response.record.udd1,
          flex: 1,
          type: 'date'
        })
      }

      if (response?.record?.udd2) {
        dynamicColumns.push({
          field: 'udd2',
          headerName: response.record.udd2,
          flex: 1,
          type: 'date'
        })
      }

      if (response?.record?.udn1) {
        dynamicColumns.push({
          field: 'udn1',
          headerName: response.record.udn1,
          flex: 1
        })
      }

      if (response?.record?.udn2) {
        dynamicColumns.push({
          field: 'udn2',
          headerName: response.record.udn2,
          flex: 1
        })
      }

      if (response?.record?.udt1) {
        dynamicColumns.push({
          field: 'udt1',
          headerName: response.record.udt1,
          flex: 1
        })
      }

      if (response?.record?.udt2) {
        dynamicColumns.push({
          field: 'udt2',
          headerName: response.record.udt2,
          flex: 1
        })
      }
    }

    dynamicColumns.push({
      field: 'siteRef',
      headerName: labels.site,
      flex: 1
    })

    setColumns(dynamicColumns)
  }
  useEffect(() => {
    getDynamicColumns(), fetchGridData()
  }, [])

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['lotId', 'siteId']}
          isLoading={false}
          pagination={false}
          maxAccess={maxAccess}
          name='avaLot'
        />
      </Grow>
    </VertLayout>
  )
}

export default LotForm
