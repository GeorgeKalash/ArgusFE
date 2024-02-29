import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { formatDateDefault } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'

import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import UndeliveredCreditOrderForm from './Forms/UndeliveredCreditOrderForm'

const UndeliveredCreditOrder = () => {
  const { getRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const { stack } = useWindow()
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CTTRXrepository.UndeliveredCreditOrder.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_corId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters }) {
    return await getRequest({
      extension: CTTRXrepository.UndeliveredCreditOrder.snapshot,
      parameters: `_filter=${filters.qry ?? ''}&_corId=${filters.corId ?? 0}`
    })
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    paginationParameters,
    access,
    filters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.UndeliveredCreditOrder.page,
    datasetId: ResourceIds.CreditOrder,
    filter: {
      endpointId: CTTRXrepository.UndeliveredCreditOrder.snapshot,
      filterFn: fetchWithFilter
    }
  })

  const onChange = value => {
    if (value) filterBy('corId', value)
    else clearFilter('corId')
  }

  const edit = obj => {
    openForm(obj.recordId)
  }
  function openForm(recordId) {
    stack({
      Component: UndeliveredCreditOrderForm,
      props: {
        setErrorMessage: setErrorMessage,
        _labels: _labels,
        maxAccess: access,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 900,
      height: 600,
      title: _labels[1]
    })
  }

  return (
    <>
      <Box>
        <div style={{ display: 'flex' }}>
          <GridToolbar
            maxAccess={access}
            onSearch={value => {
              filterBy('qry', value)
            }}
            onSearchClear={() => {
              clearFilter('qry')
            }}
            labels={_labels}
            inputSearch={true}
          >
            <Box sx={{ display: 'flex', width: '350px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                labels={_labels[5]}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                name='corId'
                values={{
                  corId: filters.corId
                }}
                valueField='recordId'
                displayField={['reference', 'name']}
                onChange={(event, newValue) => {
                  onChange(newValue?.recordId)
                }}
              />
            </Box>
          </GridToolbar>
        </div>
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
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default UndeliveredCreditOrder
