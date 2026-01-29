import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext, useMemo, useState  } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

const SECURITY_GROUP_FILTER = {
  ALL: '2',
  NO_ACCESS: '1',
  HAS_ACCESS: '3'
}

const SecurityGroupsForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [filterType, setFilterType] = useState()
  const [searchText, setSearchText] = useState('')

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    datasetId: ResourceIds.SettingsResources
  })

  async function fetchGridData() {
    const [responseSG, responseAccess] = await Promise.all([
      getRequest({
        extension: AccessControlRepository.SecurityGroup.qry,
        parameters: `_startAt=0&_pageSize=1000`
      }),
      getRequest({
        extension: AccessControlRepository.ModuleClass.qry0,
        parameters: `_resourceId=${row.resourceId}`
      })
    ])

    const merged = responseSG?.list.map(item => {
      const match = responseAccess?.list.find(sg => sg.sgId === item.recordId)
      if (!match)
        return {
          ...item,
          sgId: item.recordId,
          get: false,
          add: false,
          edit: false,
          del: false,
          close: false,
          post: false,
          unpost: false,
          reopen: false
        }

      return {
        ...item,
        sgId: item.recordId,
        ...match,
        ...match.accessFlags
      }
    })

    return { list: merged }
  }

  async function onSubmit() {
    const payload = {
      resourceId: row.resourceId,
      data: (data?.list || []).map(item => ({
        sgId: item?.sgId ?? null,
        resourceId: row?.resourceId,
        moduleId: row?.moduleId,
        accessFlags: {
          get: item?.get || false,
          add: item?.add || false,
          edit: item?.edit || false,
          del: item?.del || false,
          close: item?.close || false,
          post: item?.post || false,
          unpost: item?.unpost || false,
          reopen: item?.reopen || false
        }
      }))
    }

    await postRequest({
      extension: AccessControlRepository.ModuleClass.set2,
      record: JSON.stringify(payload)
    })

    toast.success(platformLabels.Updated)
    window.close()
  }

  const columns = [
    {
      headerName: labels.name,
      field: 'name',
      flex: 2
    },
    {
      headerName: labels.description,
      field: 'description',
      flex: 3
    },
    {
      field: 'get',
      type: 'checkbox',
      headerName: labels.get,
      flex: 1,
      editable: true
    },
    {
      field: 'add',
      type: 'checkbox',
      headerName: labels.add,
      flex: 1,
      editable: true
    },
    {
      field: 'edit',
      type: 'checkbox',
      headerName: labels.edit,
      flex: 1,
      editable: true
    },
    {
      field: 'del',
      type: 'checkbox',
      headerName: labels.del,
      flex: 1,
      editable: true
    },
    {
      field: 'close',
      type: 'checkbox',
      headerName: labels.close,
      flex: 1,
      editable: true
    },
    {
      field: 'reopen',
      type: 'checkbox',
      headerName: labels.reopen,
      flex: 1,
      editable: true
    },
    {
      field: 'post',
      type: 'checkbox',
      headerName: labels.post,
      flex: 1,
      editable: true
    },
    {
      field: 'unpost',
      type: 'checkbox',
      headerName: labels.unpost,
      flex: 1,
      editable: true
    }
  ]

  const hasAnyAccess = item => Object.values(item).some(value => value === true)

  const filteredData = useMemo(() => {
    if (!data?.list) return data

    let list = data.list

    list = list.filter(item =>
      filterType === SECURITY_GROUP_FILTER.NO_ACCESS
        ? !hasAnyAccess(item)
        : filterType === SECURITY_GROUP_FILTER.HAS_ACCESS
        ? hasAnyAccess(item)
        : true
    )

    if (searchText) {
      const value = searchText.toLowerCase()
      list = list.filter(
        item => item.name?.toLowerCase().includes(value) || item.description?.toLowerCase().includes(value)
      )
    }

    return { ...data, list }
  }, [data, filterType, searchText])

  return (
    <Form onSave={onSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2} xs={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={row.resourceId}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={row.resourceName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ASSIGNMENT_LEVEL}
                name='filter'
                label={labels.filter}
                value={filterType}
                valueField='key'
                displayField='value'
                defaultIndex={1}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  setFilterType(newValue?.key ?? SECURITY_GROUP_FILTER.ALL)
                }}
                onClear={() => setFilterType(SECURITY_GROUP_FILTER.ALL)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='search'
                value={searchText}
                label={platformLabels.Search}
                onClear={() => setSearchText('')}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                  }
                }}
                onChange={e => setSearchText(e.target.value)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table
            name='items'
            columns={columns}
            gridData={filteredData}
            rowId={['sgId']}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SecurityGroupsForm
