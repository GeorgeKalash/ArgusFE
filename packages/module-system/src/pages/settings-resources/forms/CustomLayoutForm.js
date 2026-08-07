import { Box, Grid, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import CustomLayoutRecordForm from './CustomLayoutRecordForm'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'

const CustomLayoutForm = ({ labels, maxAccess, row, invalidate, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const [data, setData] = useState({ list: [], count: 0 })

  const fetchData = async () => {
    const res = await getRequest({
      extension: SystemRepository.ReportTemplate.qry,
      parameters: `_resourceId=${row.resourceId}`
    })

    const list = (res?.list || []).map(item => ({
      ...item,
      originalInactive: item.isInactive
    }))

    setData({ count: list.length, list })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  const openForm = record => {
    stack({
      Component: CustomLayoutRecordForm,
      props: {
        labels,
        maxAccess,
        resourceId: row.resourceId,
        recordId: record?.id,
        onSuccess: fetchData
      },
      title: labels.customLayout,
      width: 600,
      height: 500
    })
  }

  const del = async record => {
    await postRequest({
      extension: SystemRepository.ReportTemplate.del, 
      record: JSON.stringify({ resourceId: row.resourceId, id: record.id })
    })

    toast.success(platformLabels.Deleted)
    fetchData()
  }

  const columns = [
    {
      field: 'id', 
      headerName: 
      labels.id, 
      flex: 0.8 
    },
    {
      field: 'reportEngineName', 
      headerName: 
      labels.reportEngineName, 
      flex: 1 
    },
    { 
      field: 'wsName', 
      headerName: labels.api, 
      flex: 1 
    },
    { 
      field: 'reportName', 
      headerName: labels.instanceName, 
      flex: 1 
    },
    { 
      field: 'assembly', 
      headerName: labels.assembly, 
      flex: 1 
    },
    { 
      field: 'parameters', 
      headerName: labels.params, 
      flex: 1 
    },
    { 
      field: 'caption', 
      headerName: labels.layoutName, 
      flex: 1 
    },
    { 
      field: 'schemaFile', 
      headerName: labels.schemaFile, 
      flex: 1 
    },
    { 
      field: 'isInactive', 
      headerName: labels.isInactive, 
      type: 'checkbox', 
      readOnly: true,
      flex: 1 
    },
    {
      flex: 0.5,
      cellRenderer: r => {
        if (r.data.originalInactive) return null
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Typography
              variant='body2'
              component='a'
              onClick={async () => {
                await postRequest({
                  extension: SystemRepository.DefaultLayout.setDefaultLayout,
                  record: JSON.stringify({ resourceId: row.resourceId, defaultLayoutId: r.data.id })
                })
                toast.success(platformLabels.Updated)
                invalidate()
                window.close()
              }}
              target='_blank'
              sx={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {labels.default}
            </Typography>
          </Box>
        )
      }
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} labels={labels} 
        leftSection={
          <Grid item xs={8} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <CustomTextField
                  name='resourceId'
                  label={labels.resourceId}
                  value={row.resourceId}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  name='resourceName'
                  label={labels.resourceName}
                  value={row.resourceName}
                  readOnly
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </Grid>
        }/>
      </Fixed>
      <Grow>
        <Table 
          name='customLayouts' 
          columns={columns} 
          gridData={data} 
          rowId={['id']} 
          pagination={false}
          onDelete={del}
          onEdit={edit}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default CustomLayoutForm
