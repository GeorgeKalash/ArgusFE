import { Box, Grid, Typography } from '@mui/material'
import Table from 'src/components/Shared/Table'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ReportLayoutsForm = ({ labels, maxAccess, row, window: w }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [data, setData] = useState([])

  const processResponses = (response, response2) => {
    const responseList = response?.list || []
    const response2List = response2?.list || []

    const response2Map = new Map(response2List.map(item => [item.id, item.isInactive]))

    const updatedList = responseList.map(item => {
      return {
        ...item,
        isInactive: response2Map.has(item.id) ? response2Map.get(item.id) : false
      }
    })

    return {
      count: updatedList.length,
      list: updatedList,
      statusId: 1,
      message: ''
    }
  }

  const fetchData = async () => {
    const response = await getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: `_resourceId=${row.resourceId}`
    })

    const response2 = await getRequest({
      extension: SystemRepository.ReportLayoutObject.qry,
      parameters: `_resourceId=${row.resourceId}`
    })

    const processedData = processResponses(response, response2)
    setData(processedData || [])
  }

  const { formik } = useForm({
    enableReinitialize: true,
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
      extension: 'KVS.asmx/getAttachment',
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
      flex: 1
    },

    {
      field: 'parameters',
      headerName: labels.parameters,
      flex: 1
    },
    {
      field: 'layoutName',
      headerName: labels.layoutName,
      flex: 1
    },
    {
      width: 100,

      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Typography
              variant='body2'
              component='a'
              onClick={async () => {
                // Await the URL before opening in a new tab
                const url = await returnURL(row.data)
                window.open(url, '_blank') // Opens the URL in a new tab
              }}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                color: 'blue',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '17px'
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.SettingsResources}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='resourceName'
              label={labels.name}
              value={formik.values.resourceId}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='resourceId'
              label={labels.reference}
              value={formik.values.resourceName}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        <Grow>
          <Table columns={columns} gridData={data} rowId={['id']} pagination={false} />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ReportLayoutsForm
