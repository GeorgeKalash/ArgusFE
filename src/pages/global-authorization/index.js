import { Box, Button, Grid, Tooltip, Typography, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { formatDateDefault } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from "src/resources/DataSets";
import GridToolbar from 'src/components/Shared/GridToolbar'
import CreditOrderForm from '../credit-order/Forms/CreditOrderForm'
import { SystemRepository } from 'src/repositories/SystemRepository'

const GlobalAuthorization = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [errorMessage, setErrorMessage] = useState(null)
  const [applyModuleLevelWindow, setApplyModuleLevelWindow] = useState(false) //check new way

  async function fetchGridData() {

    return await getRequest({
      extension: SystemRepository.ModuleClassRES.qry,
      parameters: `_filter=&_moduleId=0`
    })

  }

  async function fetchWithFilter({ filters }) {
    return await getRequest({
      extension: SystemRepository.ModuleClassRES.qry,
      parameters: `_filter=${filters.qry ?? ''}&_moduleId=${filters.moduleId ?? 10}`
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
    endpointId: SystemRepository.ModuleClassRES.qry,
    datasetId: ResourceIds.GlobalAuthorization,
    filter: {
      endpointId: SystemRepository.ModuleClassRES.qry,
      filterFn: fetchWithFilter
    }
  })

  const onChange = value => {
    if (value) filterBy('moduleId', value)
    else clearFilter('moduleId')
  }

  const edit = obj => {
    
    //openForm(obj.recordId)
  }

  const popupComponent = obj => {
    
    //openForm(obj.recordId)
  }

/*
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
  }*/

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
                datasetId={DataSets.MODULE}
                labels={labels[5]}
                
                /*columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}*/
                name='moduleId'
                values={{
                  moduleId: filters.moduleId
                }}
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  onChange(newValue?.recordId)
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', height:'48px', justifyContent: 'flex-start', pt: 2, pl: 3 }}>
            <Button variant='contained' onClick={() => setApplyModuleLevelWindow(true)}> 
              <Icon icon='mdi:arrow-expand-right' fontSize={18} />
            </Button>
            </Box>
          </GridToolbar>
        </div>
        <Table
          columns={[
            {
              field: 'key',
              headerName: labels[4],
              flex: 1
            },
            {
              field: 'value',
              headerName: labels[2],
              flex: 1
            }
          ]}
          gridData={data ?? { list: [] }}
          rowId={['key']}
          onEdit={edit}
          popupComponent={popupComponent}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType={
            (filters.qry && !filters.moduleId) || (filters.moduleId && !filters.qry) || (filters.qry && filters.moduleId)
              ? 'client'
              : filters.qry && filters.moduleId
              ? 'api'
              : 'api'
          }
        />
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GlobalAuthorization
