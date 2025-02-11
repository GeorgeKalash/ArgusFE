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
import { SaleRepository } from 'src/repositories/SaleRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import DraftForm from '../sa-draft-serials-invoices/forms/DraftForm'
import { IconButton } from '@mui/material'
import Image from 'next/image'
import ConfirmationDialog from 'src/components/ConfirmationDialog'

const PostDraftInvoice = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    clearFilter,
    labels,
    access,
    invalidate,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.DraftInvoice.page2,
    datasetId: ResourceIds.DraftSerialsInvoices,
    DatasetIdAccess: ResourceIds.PostDraftSerials,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: SaleRepository.DraftInvoice.page2,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_sortBy=recordId desc&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: SaleRepository.DraftInvoice.snapshot,
        parameters: `_filter=${filters.qry}&_status=1&_spId=0`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'spRef',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.client,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.net,
      flex: 1,
      type: 'number'
    },
    {
      field: 'weight',
      headerName: labels.totalWeight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      flex: 0.5,
      headerName: labels.post,
      cellRenderer: row => {
        if (row.data.wip === 2)
          return (
            <IconButton size='small' onClick={() => confirmationPost(row.data)}>
              <Image src={`/images/buttonsIcons/post-black.png`} width={18} height={18} alt='post.png' />
            </IconButton>
          )
      }
    }
  ]

  async function edit({ recordId }) {
    stack({
      Component: DraftForm,
      props: {
        labels,
        access,
        recordId
      },
      width: 1300,
      height: 750,
      title: labels.draftSerInv
    })
  }

  const confirmationPost = data => {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: labels.postDialogText || 'text',
        okButtonAction: window => onPost(window, data),
        fullScreen: false
      },
      width: 450,
      height: 140,
      title: platformLabels.Confirmation
    })
  }

  const onPost = async (window, data) => {
    const res = await postRequest({
      extension: SaleRepository.DraftInvoice.post,
      record: JSON.stringify(data)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      invalidate()
      window.close()
    }
  }

  const onSearch = value => {
    filterBy('qry', value)
  }

  const onClear = () => {
    clearFilter('qry')
  }

  const onApply = ({ search, rpbParams }) => {
    if (!search && rpbParams.length === 0) {
      clearFilter('params')
    } else if (!search) {
      filterBy('params', rpbParams)
    } else {
      filterBy('qry', search)
    }
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          onApply={onApply}
          onSearch={onSearch}
          onClear={onClear}
          reportName={'SADFT2'}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          refetch={refetch}
          onEdit={edit}
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

export default PostDraftInvoice
