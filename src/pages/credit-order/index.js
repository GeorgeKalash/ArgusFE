import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { formatDateDefault } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { useWindow } from 'src/windows'

// ** Windows
import { ResourceIds } from 'src/resources/ResourceIds'
import CreditOrderForm from './Forms/CreditOrderForm'

const CreditOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [plantId, setPlantId] = useState(null)
  const { stack } = useWindow()

  const getPlantId = async () => {
    const userData = window.sessionStorage.getItem('userData')
      ? JSON.parse(window.sessionStorage.getItem('userData'))
      : null

    const parameters = `_userId=${userData && userData.userId}&_key=plantId`

    try {
      const res = await getRequest({
        extension: SystemRepository.UserDefaults.get,
        parameters: parameters
      })

      if (res.record.value) {
        setPlantId(res.record.value)

        return res.record.value
      }

      setPlantId('')

      return ''
    } catch (error) {
      setErrorMessage(error)
      setPlantId('')

      return ''
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CTTRXrepository.CreditOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }
  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CTTRXrepository.CreditOrder.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    search,
    clear,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.CreditOrder.page,
    datasetId: ResourceIds.CreditOrder,
    search: {
      endpointId: CTTRXrepository.CreditOrder.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.page
  })

  const add = async () => {
    const plantId = await getPlantId()
    if (plantId !== '') {
      openFormWindow(null, plantId)
    } else {
      setErrorMessage({ error: 'The user does not have a default plant' })
    }
  }

  async function openFormWindow(recordId) {
    if (!recordId) {
      try {
        const plantId = await getPlantId()
        if (plantId !== '') {
          openForm('', plantId)
        } else {
          setErrorMessage({ error: 'The user does not have a default plant' })
        }
      } catch (error) {
        console.error(error)
      }
    } else {
      openForm(recordId)
    }
  }
  function openForm(recordId, plantId) {
    stack({
      Component: CreditOrderForm,
      props: {
        labels,
        maxAccess: access,
        plantId: plantId,
        recordId
      },
      width: 950,
      height: 600,
      title: labels[1]
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CTTRXrepository.CreditOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  return (
    <>
      <Box>
        <GridToolbar
          maxAccess={access}
          onAdd={add}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
        <Table
          columns={[
            {
              field: 'reference',
              headerName: labels[4],
              flex: 1
            },
            {
              field: 'date',
              headerName: labels[2],
              flex: 1,
              valueGetter: ({ row }) => formatDateDefault(row?.date)
            },
            {
              field: 'plantRef',
              headerName: labels[3]
            },
            {
              field: 'corName',
              headerName: labels[5],
              flex: 1
            },
            {
              field: 'currencyRef',
              headerName: labels[8],
              flex: 1
            },
            {
              field: 'amount',
              headerName: labels[10],
              flex: 1
            },
            {
              field: 'rsName',
              headerName: labels[19],
              flex: 1
            },
            {
              field: 'statusName',
              headerName: labels[21],
              flex: 1
            },
            {
              field: 'wipName',
              headerName: labels[20],
              flex: 1
            }
          ]}
          gridData={data ?? { list: [] }}
          rowId={['recordId']}
          onEdit={obj => {
            openFormWindow(obj.recordId, plantId)
          }}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CreditOrder
