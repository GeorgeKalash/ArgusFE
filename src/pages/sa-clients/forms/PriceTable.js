import { useContext, useEffect, useState } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import PriceForm from './PriceForm'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

const PriceTab = ({ labels, maxAccess, store }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [data, setData] = useState([])

  const columns = [
    {
      field: 'categoryName',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.priceType,
      flex: 1
    },
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'value',
      headerName: labels.value,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_clientId=${recordId}`
    var parameters = defaultParams

    const response = await getRequest({
      extension: SaleRepository.Price.qry,
      parameters: parameters
    })
    setData(response)

    return { ...response, _startAt: _startAt }
  }

  useEffect(() => {
    if (recordId) {
      fetchGridData()
    }
  }, [])

  const add = () => {
    openForm('')
  }

  function openForm(obj) {
    stack({
      Component: PriceForm,
      props: {
        labels: labels,
        obj,
        maxAccess: maxAccess,
        recordId,
        fetchGridData
      },
      width: 500,
      height: 400,
      title: labels.editPrice
    })
  }

  const Edit = obj => {
    openForm(obj)
  }

  const Delete = async obj => {
    await postRequest({
      extension: SaleRepository.Price.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Grow>
        <Fixed>
          <GridToolbar onAdd={add} maxAccess={maxAccess} />
        </Fixed>
        <Table
          columns={columns}
          gridData={data}
          rowId={['clientId', 'categoryId', 'currencyId', 'priceType']}
          onEdit={Edit}
          onDelete={Delete}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default PriceTab
