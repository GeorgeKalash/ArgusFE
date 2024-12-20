import { Box, Button, Grid, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useEffect } from 'react'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import FieldGlobalForm from 'src/components/Shared/FieldGlobalForm'
import { useForm } from 'src/hooks/form'
import ReportLayoutsForm from './forms/ReportLayoutsForm'
import { SystemRepository } from 'src/repositories/SystemRepository'

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
      width: 650,
      height: 600,
      title: 'reports layouts'
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
        resourceId: ResourceIds.SettingsResources
      },
      width: 500,
      height: 480,
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
          onSearch={value => {
            filters.moduleId && filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
          leftSection={
            <>
              <Grid item sx={{ width: '350px' }}>
                <ResourceComboBox
                  datasetId={DataSets.MODULE}
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
            </>
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
            field: 'Report Layout',
            headerName: labels.reportLayout,
            width: 200,

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
            width: 200,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <IconButton size='small' onClick={() => openFieldGlobal(row)}>
                  <Icon icon='mdi:application-edit-outline' fontSize={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'Custom Rules',
            headerName: labels.customRules,
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
