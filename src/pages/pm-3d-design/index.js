import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import ThreeDDesignForm from './forms/ThreeDDesignForm'

const ThreeDDesign = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ProductModelingRepository.ThreeDDesign.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ProductModelingRepository.ThreeDDesign.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.ThreeDDesign.page,
    datasetId: ResourceIds.ThreeDDesign,
    filter: {
      filterFn: fetchWithFilter
    },
    labelAccess: { cache: true }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'sketchRef',
      headerName: labels.sketchRef,
      flex: 1
    },
    {
      field: 'designerName',
      headerName: labels.Drawer,
      flex: 1
    },
    {
      field: 'castingName',
      headerName: labels.castingType,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wipName,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ThreeDDesign,
    action: async () => {
      openForm()
    }
  })

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: ThreeDDesignForm,
      props: {
        recordId: obj?.recordId
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.ThreeDDesign.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'PM3DD'} />
      </Fixed>
      <Grow>
        <Table
          name='3dDesignTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default ThreeDDesign
