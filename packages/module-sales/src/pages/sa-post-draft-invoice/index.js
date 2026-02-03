import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import DraftForm from '@argus/shared-ui/src/components/Shared/Forms/DraftForm'
import { IconButton, Box } from '@mui/material'
import Image from 'next/image'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'

const PostDraftInvoice = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
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
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
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
      field: 'clientRef',
      headerName: labels.clientRef,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'amount',
      headerName: labels.net,
      flex: 1,
      type: 'number'
    },
    {
      field: 'spName',
      headerName: labels.salesPerson,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      field: 'post',
      flex: 0.55,
      headerName: labels.post,
      cellRenderer: row => {
        if (row.data.wip === 2)
          return (
            <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
              <IconButton size='small' onClick={() => confirmationPost(row.data)}>
                <Image
                  src={require('@argus/shared-ui/src/components/images/buttonsIcons/post-black.png').default.src}
                  width={18}
                  height={18}
                  alt='post.png'
                />
              </IconButton>
            </Box>
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
        recordId,
        invalidate
      },
      title: labels.draftSerInv
    })
  }

  const confirmationPost = data => {
    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: labels.postDialogText,
        okButtonAction: () => onPost(data),
        fullScreen: false,
        close: true
      },
      width: 450,
      height: 140,
      title: platformLabels.Confirmation
    })
  }

  const onPost = async data => {
    const res = await postRequest({
      extension: SaleRepository.DraftInvoice.post,
      record: JSON.stringify(data)
    })

    if (res) {
      toast.success(platformLabels.Posted)
      invalidate()
    }
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} reportName={'SADFT2'} filterBy={filterBy} />
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
