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
import CreditInvoiceForm from './Forms/CreditInvoiceForm'

const CreditInvoice = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  //states
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

    return await getRequest({
      extension: CTTRXrepository.CreditInvoice.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }
  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CTTRXrepository.CreditInvoice.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    search,
    clear,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.CreditInvoice.qry,
    datasetId: ResourceIds.CreditInvoice,
    search: {
      endpointId: CTTRXrepository.CreditInvoice.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditInvoice.qry
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
      Component: CreditInvoiceForm,
      props: {
        _labels,
        maxAccess: access,
        plantId: plantId,
        recordId
      },
      width: 900,
      height: 600,
      title: _labels[1]
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CTTRXrepository.CreditInvoice.del,
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
          labels={_labels}
          inputSearch={true}
        />
        <Table
          columns={[
            {
              field: 'reference',
              headerName: _labels[4],
              flex: 1
            },
            {
              field: 'date',
              headerName: _labels[2],
              flex: 1,
              valueGetter: ({ row }) => formatDateDefault(row?.date)
            },
            {
              field: 'plantRef',
              headerName: _labels[3]
            },
            {
              field: 'corName',
              headerName: _labels[5],
              flex: 1
            },
            {
              field: 'currencyRef',
              headerName: _labels[8],
              flex: 1
            },
            {
              field: 'cashAccountName',
              headerName: _labels[8],
              flex: 1
            },
            {
              field: 'amount',
              headerName: _labels[10],
              flex: 1
            },
            {
              field: 'rsName',
              headerName: _labels[19],
              flex: 1
            },
            {
              field: 'statusName',
              headerName: _labels[21],
              flex: 1
            },
            {
              field: 'wipName',
              headerName: _labels[20],
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
          paginationType='client'
        />
      </Box>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CreditInvoice
