import { Box, Grid, Typography } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { KVSRepository } from '@argus/repositories/src/repositories/KVSRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ReportLayoutsForm = ({ labels, maxAccess, row, window: w }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [data, setData] = useState([])

  const fetchData = async () => {
    const reportPack = await getRequest({
      extension: SystemRepository.ReportLayout.get,
      parameters: `_resourceId=${row.resourceId}`
    })
    const pack = reportPack?.record || {}

    const response2Map = new Map((pack?.reportLayoutOverrides || []).map(item => [item.id, item.isInactive]))

    const updatedList = (pack?.layouts || []).map(item => {
      return {
        ...item,
        isInactive: response2Map.has(item.id) ? response2Map.get(item.id) : false
      }
    })

    setData({
      count: updatedList.length || 0,
      list: updatedList || [],
      statusId: 1,
      message: ''
    })
  }

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      resourceId: row.resourceId,
      resourceName: row.resourceName
    },
    onSubmit: async obj => {
      const inactiveItems = data.list
        .filter(item => item.isInactive)
        .map(item => ({
          resourceId: row.resourceId,
          id: item.id,
          isInactive: item.isInactive
        }))

      const payload = {
        resourceId: row.resourceId,
        items: inactiveItems
      }

      await postRequest({
        extension: SystemRepository.ReportLayoutObject.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)

      w.close()
    }
  })

  const returnURL = async rowData => {
    const response = await getRequest({
      extension: KVSRepository.getAttachement,
      parameters: `_resourceId=${formik.values.resourceId}&_layoutId=${rowData.id}`
    })

    return response.record.url
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    {
      field: 'api',
      headerName: labels.api,
      flex: 1
    },
    {
      field: 'instanceName',
      headerName: labels.instanceName,
      flex: 2
    },

    {
      field: 'parameters',
      headerName: labels.params,
      flex: 1
    },
    {
      field: 'layoutName',
      headerName: labels.layoutName,
      flex: 1
    },
    {
      flex: 0.5,
      field: 'post',
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Typography
              variant='body2'
              component='a'
              onClick={async () => {
                const url = await returnURL(row.data)
                window.open(url, '_blank')
              }}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              preview
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      type: 'checkbox',
      editable: true
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextField
                name='resourceId'
                label={labels.resourceId}
                value={formik.values.resourceId}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid xs={5}></Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='resourceName'
                label={labels.resourceName}
                value={formik.values.resourceName}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <Table columns={columns} gridData={data} rowId={['id']} pagination={false} />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ReportLayoutsForm
