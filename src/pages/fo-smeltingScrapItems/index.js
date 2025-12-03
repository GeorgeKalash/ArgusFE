import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { FoundryRepository } from 'src/repositories/FoundryRepository'
import SmeltingScrapItemsForm from './Forms/SmeltingScrapItemsForm'

const SmeltingScrapItems = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FoundryRepository.MetalSettings.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.MetalSettings.page,
    datasetId: ResourceIds.SmeltingScrapItems
  })

  const columns = [
    {
      field: 'metalRef',
      headerName: labels.metal,
      flex: 1
    },
    {
      field: 'metalColorRef',
      headerName: labels.metalColor,
      flex: 1
    },
    {
      field: 'rate',
      headerName: labels.rate,
      flex: 1,
      type: 'number'
    },
    {
      field: 'stdLossRate',
      headerName: labels.stdLossRate,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: SmeltingScrapItemsForm,
      props: {
        labels,
        recordId: obj?.metalId,
        metalRef: obj?.metalRef,
        maxAccess: access
      },
      width: 800,
      height: 500,
      title: labels.SmeltingScrapItems
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['metalId']}
          onEdit={edit}
          refetch={refetch}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default SmeltingScrapItems
