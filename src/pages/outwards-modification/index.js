import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import OutwardsModificationForm from './Forms/OutwardsModificationForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

const OutwardsModification = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }
  async function fetchWithSearch({ filters }) {
    return await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsModification.snapshot,
      parameters: `_filter=${filters.qry}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    access,
    filterBy,
    clearFilter
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RemittanceOutwardsRepository.OutwardsModification.page,
    datasetId: ResourceIds.OutwardsModification,
    filter: {
      endpointId: RemittanceOutwardsRepository.OutwardsModification.snapshot,
      filterFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'owRef',
      headerName: _labels.outwardReference,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'rsName',
      headerName: _labels.rsName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: _labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: _labels.wipName,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: OutwardsModificationForm,
      props: {
        labels: _labels,
        recordId,
        access
      },
      width: 1200,
      height: 650,
      title: _labels.outwardsModification
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.OutwardsModification,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default OutwardsModification
