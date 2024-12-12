import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CaDocumentTypeDefaultForm from './form/CaDocumentTypeDefaultForm'
import { SystemFunction } from 'src/resources/SystemFunction'

const CaDocumentTypeDefault = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: CashBankRepository.DocumentTypeDefault.page,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_functionId=${SystemFunction.CashTransfer}`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.CaDtd
  })

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.documentType,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'fromCashAccountName',
      headerName: _labels.fromCa,
      flex: 1
    },
    {
      field: 'toCashAccountName',
      headerName: _labels.toCa,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.DocumentTypeDefault.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: CaDocumentTypeDefaultForm,
      props: {
        labels: _labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 400,
      title: _labels.dtDefault
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default CaDocumentTypeDefault
