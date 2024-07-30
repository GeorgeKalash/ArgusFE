import { Box, Grid } from '@mui/material'
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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const UndeliveredCreditOrder = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const userData = window.sessionStorage.getItem('userData')
    ? JSON.parse(window.sessionStorage.getItem('userData'))
    : null

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
        labels: labels,
        maxAccess: access,
        recordId: recordId ? recordId : null,
        maxAccess: access,
        userData: userData
      },
      width: 950,
      title: labels.creditOrder
    })
  }

  return (
    <VertLayout>
      <Fixed>
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
          leftSection={
            <Grid item sx={{ display: 'flex', width: '300px' }}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Correspondent.qry}
                label={labels.correspondent}
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
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={[
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
              field: 'plantRef',
              headerName: labels.plant
            },
            {
              field: 'corName',
              headerName: labels.correspondent,
              flex: 1
            },
            {
              field: 'currencyRef',
              headerName: labels.currency,
              flex: 1
            },
            {
              field: 'amount',
              headerName: labels.amount,
              flex: 1
            },
            {
              field: 'rsName',
              headerName: labels.releaseStatus,
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
      </Grow>
    </VertLayout>
  )
}

export default UndeliveredCreditOrder
