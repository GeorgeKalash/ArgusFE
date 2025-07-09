import { Grid } from '@mui/material'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomButton from 'src/components/Inputs/CustomButton'
import { ControlContext } from 'src/providers/ControlContext'
import { formatDateForGetApI } from 'src/lib/date-helper'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ResourcePerformance = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.TransactionLogPerformance
  })

  const { formik } = useForm({
    initialValues: {
      resourceId: null,
      moduleId: null,
      minimumDuration: null,
      fromDT: null,
      toDT: null,
      data: { list: [] }
    },
    validateOnChange: true,
    validationSchema: yup.object({
      minimumDuration: yup.number().required()
    }),
    onSubmit: async values => {
      const res = await getRequest({
        extension: SystemRepository.ResourcePerformance.qry,
        parameters: `_resourceId=${values.resourceId || 0}&_minimumDuration=${values.minimumDuration}&_fromDT=${
          values.fromDT ? formatDateForGetApI(values.fromDT) : ''
        }&_toDT=${values.toDT ? formatDateForGetApI(values.toDT) : ''}`
      })

      formik.setFieldValue('data', res)
    }
  })

  const columns = [
    {
      field: 'username',
      headerName: labels.username,
      flex: 1
    },
    {
      field: 'resourceName',
      headerName: labels.resourceName,
      flex: 1
    },
    {
      field: 'duration',
      headerName: labels.duration,
      flex: 1
    },
    {
      field: 'requestTime',
      headerName: labels.requestTime,
      flex: 1,
      type: 'date'
    },
    {
      field: 'responseTime',
      headerName: labels.responseTime,
      flex: 1,
      type: 'date'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={2}>
            <ResourceComboBox
              datasetId={DataSets.MODULE}
              label={labels.module}
              name='moduleId'
              values={formik.values}
              valueField='key'
              displayField='value'
              onChange={(_, newValue) => {
                formik.setFieldValue('moduleId', newValue?.key || null)
                formik.setFieldValue('resourceId', '')
              }}
              error={formik.touched.moduleId && Boolean(formik.errors.moduleId)}
            />
          </Grid>
          <Grid item xs={2}>
            <ResourceComboBox
              endpointId={formik.values.moduleId && SystemRepository.ModuleClassRES.qry}
              parameters={`_moduleId=${formik.values.moduleId}&_filter=`}
              label={labels.res}
              readOnly={!formik.values.moduleId}
              name='resourceId'
              values={formik.values}
              valueField='key'
              displayField='value'
              onChange={(_, newValue) => {
                formik.setFieldValue('resourceId', newValue?.key || null)
              }}
              error={formik.touched.resourceId && Boolean(formik.errors.resourceId)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomNumberField
              name='minimumDuration'
              label={labels.minimumDuration}
              value={formik.values.minimumDuration}
              maxAccess={access}
              required
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('minimumDuration', null)}
              error={formik.touched.minimumDuration && Boolean(formik.errors.minimumDuration)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomDatePicker
              name='fromDT'
              label={labels.fromDT}
              value={formik.values.fromDT}
              onChange={formik.setFieldValue}
              maxAccess={access}
              onClear={() => formik.setFieldValue('fromDT', null)}
              error={formik.touched.fromDT && Boolean(formik.errors.fromDT)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomDatePicker
              name='toDT'
              label={labels.toDT}
              value={formik.values.toDT}
              onChange={formik.setFieldValue}
              maxAccess={access}
              onClear={() => formik.setFieldValue('toDT', null)}
              error={formik.touched.toDT && Boolean(formik.errors.toDT)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton
              variant='contained'
              label={platformLabels.Preview}
              image={'preview.png'}
              onClick={() => formik.handleSubmit()}
              color='#231f20'
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={formik.values.data}
          rowId={['logId']}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Grow>
    </VertLayout>
  )
}

export default ResourcePerformance
