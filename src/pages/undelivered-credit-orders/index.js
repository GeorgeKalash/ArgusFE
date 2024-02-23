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

// ** Windows
import UndeliveredCreditOrderWindow from './Windows/UndeliveredCreditOrderWindow'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import GridToolbarWithCombo from 'src/components/Shared/GridToolbarWithCombo'

const UndeliveredCreditOrder = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [corId, setCorId] = useState(0)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const cor = corId

    return await getRequest({
      extension: CTTRXrepository.UndeliveredCreditOrder.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_corId=0`
    })
  }
  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: CTTRXrepository.UndeliveredCreditOrder.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.UndeliveredCreditOrder.qry
  })

  const {
    query: { data },
    labels: _labels,
    search,
    clear,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.UndeliveredCreditOrder.qry,
    datasetId: ResourceIds.CreditOrder,
    search: {
      endpointId: CTTRXrepository.UndeliveredCreditOrder.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  return (
    <>
      <Box>
        <GridToolbarWithCombo
          maxAccess={access}
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
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <UndeliveredCreditOrderWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setErrorMessage={setErrorMessage}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default UndeliveredCreditOrder
