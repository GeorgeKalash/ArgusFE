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
import { useEffect } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import ReportLayoutsForm from './forms/ReportLayoutsForm'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomLayoutForm from './forms/CustomLayoutForm'
import CustomRulesForm from './forms/CustomRulesForm'
import SecurityGroupsForm from './forms/SecurityGroupsForm'

const GlobalAuthorization = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchWithFilter({ filters }) {
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
    datasetId: ResourceIds.SettingsResources,
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

  function openReportLayoutsForm(row) {
    stack({
      Component: ReportLayoutsForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value, moduleId: filters.moduleId },
        invalidate,
        resourceId: ResourceIds.SettingsResources
      },
      width: 1200,
      height: 600,
      title: labels.reportLayout
    })
  }

  function openCustomLayout(row) {
    stack({
      Component: CustomLayoutForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value },
        invalidate,
        resourceId: ResourceIds.SettingsResources
      },
      width: 800,
      height: 480,
      title: labels.printTemplates
    })
  }

  function openCustomRules(row) {
    stack({
      Component: CustomRulesForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value },
        invalidate,
        resourceId: ResourceIds.SettingsResources
      },
      width: 800,
      height: 480,
      title: labels.customRules
    })
  }

  function openSecurityGroupsForm(row) {
    stack({
      Component: SecurityGroupsForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value, moduleId: filters.moduleId },
        invalidate,
        resourceId: ResourceIds.SettingsResources
      },
      width: 1200,
      height: 600,
      title: labels.securityGroup
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
            <Grid item xs={2.5}>
              <ResourceComboBox
                datasetId={DataSets.MODULE}
                label={labels.module}
                name='moduleId'
                values={{
                  moduleId: filters.moduleId
                }}
                valueField='key'
                displayField='value'
                onChange={(event, newValue) => {
                  onChange(newValue?.key)
                }}
                error={!filters.moduleId}
              />
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
            flex: 4
          },
          {
            field: 'Report Layout',
            headerName: labels.reportLayout,
            flex: 1,

            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openReportLayoutsForm(row)}>
                  <Icon icon='mdi:application-edit-outline' fontSize={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'Custom Layout',
            headerName: labels.customLayout,
            flex: 1,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openCustomLayout(row)}>
                  <Icon icon='mdi:application-edit-outline' fontSize={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'Custom Rules',
            headerName: labels.customRules,
            flex: 1,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openCustomRules(row)}>
                  <Icon icon='mdi:application-edit-outline' fontSize={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'Security Groups',
            headerName: labels.securityGroup,
            flex: 1,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openSecurityGroupsForm(row)}>
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
