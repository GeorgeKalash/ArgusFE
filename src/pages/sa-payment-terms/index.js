import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useWindow } from 'src/windows'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ControlContext } from 'src/providers/ControlContext'
import PaymentTermsForms from './forms/PaymentTermsForms'

const PaymentTerms = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: SaleRepository.PaymentTerms.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    access,
    paginationParameters,
    invalidate,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.PaymentTerms.qry,
    datasetId: ResourceIds.PaymentTerm
  })

  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: _labels.paymentType,
      flex: 1
    },
    {
      field: 'days',
      headerName: _labels.days,
      flex: 1
    },
    {
      field: 'discountDays',
      headerName: _labels.discountDays,
      flex: 1
    },
    {
      field: 'discount',
      headerName: _labels.discount,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: PaymentTermsForms,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 700,
      height: 470,
      title: _labels.paymentTerms
    })
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: SaleRepository.PaymentTerms.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
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
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          refetch={refetch}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PaymentTerms
