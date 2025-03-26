import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { Router } from 'src/lib/useRouter'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import PurchaseDTDForm from './Forms.js/PurchaseDTDForm'

const PurchaseDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: PurchaseRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    access,
    invalidate,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.PUDocumentTypeDefaults
  })

  const columns = [
    {
      field: 'commitItems',
      headerName: labels.commitItems,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
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
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: PurchaseDTDForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access,
        functionId
      },
      width: 500,
      height: 430,
      title: labels.DocumentTypeDefault
    })
  }

  const add = async () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: PurchaseRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name={'table'}
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PurchaseDTD
