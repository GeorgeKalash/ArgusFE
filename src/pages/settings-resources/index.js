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
import ResourceGlobalForm from 'src/components/Shared/ResourceGlobalForm'
import FieldGlobalForm from 'src/components/Shared/FieldGlobalForm'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { SCRepository } from 'src/repositories/SCRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useForm } from 'src/hooks/form'

const GlobalAuthorization = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [data, setData] = useState([])

  const {
    labels: labels,
    refetch,
    maxAccess,
    invalidate,
    filters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SATrx.qry,
    datasetId: ResourceIds.SalesTrxForm
  })

  async function fetchGridData() {
    if (!formik.values.moduleId) return

    const res = await getRequest({
      extension: SystemRepository.ModuleClassRES.qry,
      parameters: `_filter=&_moduleId=${formik.values.moduleId}`
    })

    setData(res)
  }

  const { formik } = useForm({
    initialValues: {
      moduleId: null
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true
  })

  function openResourceGlobal(row) {
    stack({
      Component: ResourceGlobalForm,
      props: {
        labels: labels,
        maxAccess: access,
        row: { resourceId: row.data.key, resourceName: row.data.value, moduleId: filters.moduleId },
        invalidate,
        resourceId: ResourceIds.GlobalAuthorization
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
        row: { resourceId: row.data.key, resourceName: row.data.value },
        invalidate,
        resourceId: ResourceIds.GlobalAuthorization
      },
      width: 500,
      height: 480,
      title: labels.fieldGlobal
    })
  }

  useEffect(() => {
    ;(async function () {
      await fetchGridData()
    })()
  }, [formik.values.moduleId])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          labels={labels}
          leftSection={
            <>
              <Grid item sx={{ width: '350px' }}>
                <ResourceComboBox
                  datasetId={DataSets.MODULE}
                  label={labels.module}
                  name='moduleId'
                  values={formik.values}
                  valueField='key'
                  displayField='value'
                  onChange={(event, newValue) => {
                    formik.setFieldValue('moduleId', newValue ? newValue.key : '')
                  }}
                  error={!formik.values.moduleId}
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
                <IconButton size='small' onClick={() => openResourceGlobal(row)}>
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
