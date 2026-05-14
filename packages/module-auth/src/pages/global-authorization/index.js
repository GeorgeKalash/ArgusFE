import { Box, Grid, IconButton } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useEffect } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ResourceGlobalForm from '@argus/shared-ui/src/components/Shared/ResourceGlobalForm'
import FieldGlobalForm from '@argus/shared-ui/src/components/Shared/FieldGlobalForm'
import AccessLevelForm from '@argus/shared-ui/src/components/Shared/AccessLevelForm'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const GlobalAuthorization = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchWithFilter({ filters }) {
    // used for both qry and filter since we have same api
    if (filters.moduleId)
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
    filters,
    invalidate
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
        moduleId: filters.moduleId,
        invalidate,
        resourceId: ResourceIds.GlobalAuthorization
      }
    })
  }

  function openResourceGlobal(row) {
    stack({
      Component: ResourceGlobalForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value, moduleId: filters.moduleId },
        resourceId: ResourceIds.GlobalAuthorization
      }
    })
  }

  function openFieldGlobal(row) {
    stack({
      Component: FieldGlobalForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value },
        invalidate,
        resourceId: ResourceIds.GlobalAuthorization
      },
      title: labels.fieldGlobal
    })
  }

  useEffect(() => {
    filters.moduleId = 10
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onSearch={value => filters.moduleId && (!value ? clearFilter('qry') : filterBy('qry', value))}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
          leftSection={
            <Grid item xs={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                  <ResourceComboBox
                    datasetId={DataSets.MODULE}
                    name='moduleId'
                    values={{ moduleId: filters.moduleId }}
                    valueField='key'
                    displayField='value'
                    onChange={(_, newValue) => {
                      onChange(newValue?.key)
                    }}
                  />
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomButton
                    onClick={openApplyModuleLevel}
                    disabled={!filters.moduleId}
                    icon={<Icon icon='mdi:arrow-expand-right' fontSize={20} />}
                    tooltipText={labels.applyModuleLevel}
                  />
                </Grid>
              </Grid>
            </Grid>
          }
        />
      </Fixed>
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
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openResourceGlobal(row)}>
                  <Icon icon='mdi:application-edit-outline' fontSize={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'field Global',
            headerName: labels.fieldGlobal,
            width: 200,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openFieldGlobal(row)}>
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
    </VertLayout>
  )
}

export default GlobalAuthorization
