import { Box, Grid, IconButton } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useContext, useMemo } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useEffect } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import ResourceGlobalForm from '@argus/shared-ui/src/components/Shared/ResourceGlobalForm'
import FieldGlobalForm from '@argus/shared-ui/src/components/Shared/FieldGlobalForm'
import AccessLevelForm from '@argus/shared-ui/src/components/Shared/AccessLevelForm'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const SGAccessLevelTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { getAllKvsByDataset } = useContext(CommonContext)

  const { formik } = useForm({
    maxAccess,
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
      }
    })
  }

  function openResourceGlobal(row) {
    stack({
      Component: ResourceGlobalForm,
      props: {
        labels: labels,
        maxAccess,
        row: row.data,
        resourceId: ResourceIds.SecurityGroup
      }
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
      title: labels.controlAccessLevel
    })
  }

  const search = formik.values.search

  const filteredData = useMemo(() => {
    const list = data?.list || []

    if (!search) return data

    return {
      ...data,
      list: list.filter(
        item =>
          (item.resourceId && item.resourceId.toString()?.includes(search)) ||
          (item.resourceName && item.resourceName.toLowerCase().includes(search.toLowerCase()))
      )
    }
  }, [data?.list, search])

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
      <Box sx={{ px: 2, py: 1 }}>
        <Grid
          container
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={5}>
            <ResourceComboBox
              datasetId={DataSets.MODULE}
              name="moduleId"
              values={{ moduleId: filters.moduleId }}
              valueField="key"
              displayField="value"
              onChange={(_, newValue) => {
                onChange(newValue?.key)
              }}
            />
          </Grid>
          <Grid
            item
            xs={1}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CustomButton
              onClick={openApplyModuleLevel}
              icon={<Icon icon="mdi:arrow-expand-right" width={18} height={18} />}
              tooltipText={labels.controlAccess}
            />
          </Grid>
          <Grid item xs={5}>
            <CustomTextField
              name="search"
              value={formik.values.search}
              label={labels.search}
              onClear={() => formik.setFieldValue('search', '')}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
    </Fixed>
    <Grow>
      <Table
        name="accessLevel"
        columns={[
          {
            field: 'resourceId',
            headerName: labels.classId,
            flex: 1
          },
          {
            field: 'resourceName',
            headerName: labels.className,
            flex: 2
          },
          {
            field: 'resourceGlobal',
            headerName: labels.resourceGlobal,
            flex: 1,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton size="small" onClick={() => openResourceGlobal(row)}>
                  <Icon icon="mdi:application-edit-outline" width={18} height={18} />
                </IconButton>
              </Box>
            )
          },
          {
            field: 'Control Access',
            headerName: labels.controlAccess,
            flex: 1,
            cellRenderer: row => (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton size="small" onClick={() => openFieldGlobal(row)}>
                  <Icon icon="mdi:application-edit-outline" width={18} height={18} />
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
