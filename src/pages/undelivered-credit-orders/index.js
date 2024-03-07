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
import CreditOrderForm from '../credit-order/Forms/CreditOrderForm'

const UndeliveredCreditOrder = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
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
    refetch,
    labels: labels,
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
      Component: CreditOrderForm,
      props: {
        setErrorMessage: setErrorMessage,
        labels: labels,
        maxAccess: access,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 950,
      height: 600,
      title: labels[1]
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
            labels={labels}
            inputSearch={true}
          >
            <Box sx={{ display: 'flex', width: '350px', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                labels={labels[5]}
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
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType={
            (filters.qry && !filters.corId) || (filters.corId && !filters.qry) || (filters.qry && filters.corId)
              ? 'client'
              : filters.qry && filters.corId
              ? 'api'
              : 'api'
          }
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default UndeliveredCreditOrder
