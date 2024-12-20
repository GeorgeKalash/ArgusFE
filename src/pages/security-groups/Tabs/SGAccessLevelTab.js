import { Box, Button, Grid, IconButton } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useEffect } from 'react'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { CommonContext } from 'src/providers/CommonContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceGlobalForm from 'src/components/Shared/ResourceGlobalForm'
import FieldGlobalForm from 'src/components/Shared/FieldGlobalForm'
import AccessLevelForm from 'src/components/Shared/AccessLevelForm'

const SGAccessLevelTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      sgId: storeRecordId,
      search: ''
    }
  })
  async function fetchGridData({ filters }) {
    if (!filters.moduleId) {
      filters.moduleId = 10
    }
    const accessLevel = await getAccessLevel()

    const moduleRes = await getRequest({
      extension: AccessControlRepository.ModuleClass.qry,
      parameters: `_sgId=${storeRecordId}&_filter=&_moduleId=${filters?.moduleId ?? 10}&_resourceId=0`
    })

    const mergedModules = moduleRes.list.map(moduleItem => {
      const matchingModule = accessLevel.find(y => moduleItem.accessLevel == y.key)

      return {
        ...moduleItem,
        accessLevelString: matchingModule ? matchingModule.value : null
      }
    })

    return { list: mergedModules }
  }

  async function getAccessLevel() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.ACCESS_LEVEL,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const {
    query: { data },
    refetch,
    filterBy,
    filters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: AccessControlRepository.ModuleClass.qry,
    datasetId: ResourceIds.SecurityGroup,
    enabled: Boolean(storeRecordId),
    filter: {
      filterFn: fetchGridData,
      default: { moduleId: 10 }
    }
  })

  const onChange = value => {
    filterBy('moduleId', value)
  }

  function openApplyModuleLevel() {
    stack({
      Component: AccessLevelForm,
      props: {
        labels: labels,
        maxAccess,
        data,
        moduleId: filters.moduleId,
        invalidate,
        resourceId: ResourceIds.SecurityGroup
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
        maxAccess,
        row: row.data,
        invalidate,
        resourceId: ResourceIds.SecurityGroup
      },
      width: 450,
      height: 300,
      title: labels.accessLevel
    })
  }

  function openFieldGlobal(row) {
    stack({
      Component: FieldGlobalForm,
      props: {
        labels: labels,
        maxAccess,
        row: row.data,
        invalidate,
        resourceId: ResourceIds.SecurityGroup
      },
      width: 500,
      height: 480,
      title: labels.controlAccessLevel
    })
  }

  const filteredData = data && {
    ...data,
    list: data.list.filter(
      item =>
        (item.resourceId && item.resourceId.toString().includes(formik.values.search)) ||
        (item.resourceName && item.resourceName.toLowerCase().includes(formik.values.search.toLowerCase()))
    )
  }

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  useEffect(() => {
    filters.moduleId = 10
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <Grid container xs={12}>
          <Grid item xs={5} sx={{ pl: 2, pt: 2 }}>
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
            />
          </Grid>
          <Grid xs={1} item sx={{ pt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant='contained' onClick={() => openApplyModuleLevel()} disabled={!filters.moduleId}>
              <Icon icon='mdi:arrow-expand-right' fontSize={20} />
            </Button>
          </Grid>
          <Grid xs={5} item sx={{ pt: 2, pr: 2 }}>
            <CustomTextField
              name='search'
              value={formik.values.search}
              label={labels.search}
              onClear={() => {
                formik.setFieldValue('search', '')
              }}
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={[
            {
              field: 'resourceId',
              headerName: labels.classId,
              flex: 1
            },
            {
              field: 'resourceName',
              headerName: labels.className,
              flex: 1
            },
            {
              field: 'accessLevelString',
              headerName: labels.accessLevel,
              flex: 1
            },
            {
              field: '',
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
              field: 'Control Access',
              headerName: labels.controlAccess,
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
          gridData={filteredData}
          rowId={['sgId', 'moduleId', 'resourceId']}
          isLoading={false}
          maxAccess={maxAccess}
          refetch={refetch}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default SGAccessLevelTab
