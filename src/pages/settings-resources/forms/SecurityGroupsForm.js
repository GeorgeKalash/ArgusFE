import { Grid } from '@mui/material'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useMemo, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import Table from 'src/components/Shared/Table'
import { useResourceQuery } from 'src/hooks/resource'
import Form from 'src/components/Shared/Form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

const SecurityGroupsForm = ({ labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [filterType, setFilterType] = useState('2')

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

  const hasAnyAccess = item =>
    item.get || item.add || item.edit || item.del || item.close || item.post || item.unpost || item.reopen

  const filteredData = useMemo(() => {
    if (!data?.list) return data

    let list = data.list

    if (filterType == 1) {
      list = list.filter(item => !hasAnyAccess(item))
    }

    if (filterType == 3) {
      list = list.filter(item => hasAnyAccess(item))
    }

    return { ...data, list }
  }, [data, filterType])

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
                datasetId={DataSets.FILTER}
                name='filter'
                label={labels.filter}
                value={filterType}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  setFilterType(newValue?.key ?? 2)
                }}
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
