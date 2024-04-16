import { Box, Button, Grid, Tooltip, Typography, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'

import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ResourceGlobalForm from './forms/ResourceGlobalForm'
import AccessLevelForm from './forms/AccessLevelForm'
import FieldGlobalForm from './forms/FieldGlobalForm'
import { SystemRepository } from 'src/repositories/SystemRepository'

const GlobalAuthorization = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchWithFilter({ filters }) {
    // used for both qry and filter since we have same api

    return await getRequest({
      extension: SystemRepository.ModuleClassRES.qry,
      parameters: `_filter=${filters.qry ?? ''}&_moduleId=${filters.moduleId}`
    })
  }

  const {
    query: { data },
    refetch,
    labels: labels,
    filterBy,
    clearFilter,
    access,
    filters
  } = useResourceQuery({
    queryFn: fetchWithFilter,
    endpointId: SystemRepository.ModuleClassRES.qry,
    datasetId: ResourceIds.GlobalAuthorization,
    filter: {
      filterFn: fetchWithFilter,
      default: { moduleId: 10 }
    }
  })

  const onChange = value => {
    if (value) {
      filterBy('moduleId', value)
    } else {
      clearFilter('moduleId')
    }
  }

  function openApplyModuleLevel() {
    stack({
      Component: AccessLevelForm,
      props: {
        labels: labels,
        maxAccess: access,
        data,
        moduleId: filters.moduleId
      },
      width: 450,
      height: 200,
      title: labels.accessLevel
    })
  }

  function openResourceGlobal(row) {
    stack({
      Component: ResourceGlobalForm,
      props: {
        labels: labels,
        maxAccess: access,
        resourceId: row.key,
        resourceName: row.value,
        moduleId: filters.moduleId
      },
      width: 450,
      height: 300,
      title: labels.resourceGlobal
    })
  }

  function openFieldGlobal(row) {
    stack({
      Component: FieldGlobalForm,
      props: {
        labels: labels,
        maxAccess: access,
        resourceId: row.key,
        resourceName: row.value
      },
      width: 500,
      height: 480,
      title: labels.fieldGlobal
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
                datasetId={DataSets.MODULE}
                name='moduleId'
                values={{
                  moduleId: filters.moduleId ?? 10
                }}
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  onChange(newValue?.key)
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', height: '48px', justifyContent: 'flex-start', pt: 2, pl: 3 }}>
              <Button variant='contained' onClick={() => openApplyModuleLevel()}>
                <Icon icon='mdi:arrow-expand-right' fontSize={18} />
              </Button>
            </Box>
          </GridToolbar>
        </div>
        <Table
          columns={[
            {
              field: 'key',
              headerName: labels.resourceId,
              flex: 1
            },
            {
              field: 'value',
              headerName: labels.resourceName,
              flex: 1
            },
            {
              field: 'Resource Global',
              headerName: labels.resourceGlobal,
              width: 200,
              renderCell: params => (
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                  <IconButton size='small' onClick={() => openResourceGlobal(params.row)}>
                    <Icon icon='mdi:application-edit-outline' fontSize={18} />
                  </IconButton>
                </Box>
              )
            },
            {
              field: 'field Global',
              headerName: labels.fieldGlobal,
              width: 200,
              renderCell: params => (
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                  <IconButton size='small' onClick={() => openFieldGlobal(params.row)}>
                    <Icon icon='mdi:application-edit-outline' fontSize={18} />
                  </IconButton>
                </Box>
              )
            }
          ]}
          gridData={data ?? { list: [] }}
          rowId={['key']}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          refetch={refetch}
          paginationType='client'
        />
      </Box>
    </>
  )
}

export default GlobalAuthorization
