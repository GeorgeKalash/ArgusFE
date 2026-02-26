import { Grid } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { formatDateTimeForGetAPI } from '@argus/shared-domain/src/lib/date-helper'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomDateTimePicker from '@argus/shared-ui/src/components/Inputs/CustomDateTimePicker'
import TransactionLogPerformance from './Forms/TransactionLogPerformance'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const ResourcePerformance = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const now = new Date()
  const fromDT = new Date(now.getTime() - 5 * 60 * 1000) 
  const toDT = now

  const { formik } = useForm({
    initialValues: {
      resourceId: null,
      moduleId: null,
      minimumDuration: null,
      fromDT,
      toDT
    },
    validateOnChange: true,
    validationSchema: yup.object({
      minimumDuration: yup.number().required(),
      fromDT: yup.date().required(),
      toDT: yup.date().required()
    })
  })
  useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date()
    const fromDT = new Date(now.getTime() - 5 * 60 * 1000)
    const toDT = now

    formik.setValues(prev => ({
      ...prev,
      fromDT,
      toDT
    }))
  }, 60 * 1000)

  return () => clearInterval(interval)
}, [])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    if (formik.values.minimumDuration === null || formik.values.fromDT === null || formik.values.toDT === null) {
      return
    }

    const response = await getRequest({
      extension: SystemRepository.ResourcePerformance.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_resourceId=${
        formik.values.resourceId || 0
      }&_minimumDuration=${formik.values.minimumDuration}&_fromDT=${formatDateTimeForGetAPI(
        formik.values.fromDT
      )}&_toDT=${formatDateTimeForGetAPI(formik.values.toDT)}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    access,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.ResourcePerformance.page,
    datasetId: ResourceIds.TransactionLogPerformance
  })

  const openInfo = async obj => {
    stack({
      Component: TransactionLogPerformance,
      props: {
        recordId: obj?.logId
      },
      width: 500,
      height: 600,
      title: platformLabels.TransactionLog
    })
  }

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
      type: 'dateTime',
      dateFormat: 'hh:mm:ss a'
    },
    {
      field: 'responseTime',
      headerName: labels.responseTime,
      flex: 1,
      type: 'dateTime',
      dateFormat: 'hh:mm:ss a'
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
              required
              value={formik?.values?.minimumDuration}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('minimumDuration', '')}
              error={formik.touched.minimumDuration && Boolean(formik.errors.minimumDuration)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomDateTimePicker
              name='fromDT'
              label={labels.fromDT}
              onChange={formik.setFieldValue}
              maxAccess={access}
              required
              onClear={() => formik.setFieldValue('fromDT', null)}
              value={formik.values?.fromDT}
              error={formik.errors?.fromDT && Boolean(formik.errors?.fromDT)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomDateTimePicker
              name='toDT'
              label={labels.toDT}
              onChange={formik.setFieldValue}
              maxAccess={access}
              required
              onClear={() => formik.setFieldValue('toDT', null)}
              value={formik.values?.toDT}
              error={formik.errors?.toDT && Boolean(formik.errors?.toDT)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton
              variant='contained'
              label={platformLabels.Preview}
              image={'preview.png'}
              onClick={() => {
                formik.validateForm().then(() => {
                  formik.setTouched({
                    moduleId: true,
                    resourceId: true,
                    minimumDuration: true,
                    fromDT: true,
                    toDT: true
                  })
                })
                refetch()
              }}
              color='#231f20'
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['logId']}
          pageSize={50}
          paginationType='api'
          onEdit={openInfo}
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ResourcePerformance
