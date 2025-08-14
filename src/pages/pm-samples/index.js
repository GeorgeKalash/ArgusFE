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
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import SamplesForm from './Forms/SamplesForm'

const PMSamples = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

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
    endpointId: ProductModelingRepository.Samples.page,
    datasetId: ResourceIds.Samples,
    filter: {
      filterFn: fetchWithFilter
    }
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
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.site,
      flex: 1
    },
    {
      field: 'jobRef',
      headerName: labels.jobRef,
      flex: 1
    },
    {
      field: 'productionStandardRef',
      headerName: labels.productionStandard,
      flex: 1
    },
    {
      field: 'productionLineRef',
      headerName: labels.productionLine,
      flex: 1
    },
    {
      field: 'productionLineName',
      headerName: labels.productionLineName,
      flex: 1
    },
    {
      field: 'productionClassRef',
      headerName: labels.productionClassRef,
      flex: 1
    },
    {
      field: 'productionClassName',
      headerName: labels.productionClass,
      flex: 1
    },
    {
      field: 'designGroupName',
      headerName: labels.designGroup,
      flex: 1
    },
    {
      field: 'designFamilyName',
      headerName: labels.familyGroup,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.rsName,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ProductModelingRepository.Samples.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry)
      return await getRequest({
        extension: ProductModelingRepository.Samples.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Samples,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: SamplesForm,
      props: {
        labels,
        access,
        recordId
      },
      width: 1200,
      height: 680,
      title: labels.samples
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.Samples.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'PMSPL'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          deleteConfirmationType={'strict'}
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

export default PMSamples
