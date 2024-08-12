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
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import PaymentTermsForm from './forms/PaymentTermsForm'

const PaymentTerm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: PurchaseRepository.PaymentTerms.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=`
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
    endpointId: PurchaseRepository.PaymentTerms.qry,
    datasetId: ResourceIds.PUPaymentTerms
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
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
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: PurchaseRepository.PaymentTerms.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: PaymentTermsForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 450,
      title: _labels.paymentTerms
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
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

export default PaymentTerm
