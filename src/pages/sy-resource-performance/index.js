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
import CustomButton from 'src/components/Inputs/CustomButton'
import { ControlContext } from 'src/providers/ControlContext'
import { formatDateTimeForGetAPI } from 'src/lib/date-helper'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'
import { useWindow } from 'src/windows'
import TransactionLogPerformance from './Forms/TransactionLogPerformance'

const ResourcePerformance = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const tomorrowEnd = new Date()
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)
  tomorrowEnd.setHours(23, 59, 0, 0)

  const { formik } = useForm({
    initialValues: {
      resourceId: null,
      moduleId: null,
      minimumDuration: null,
      fromDT: todayStart,
      toDT: tomorrowEnd
    },
    validateOnChange: true,
    validationSchema: yup.object({
      minimumDuration: yup.number().required(),
      fromDT: yup.date().required(),
      toDT: yup.date().required()
    })
  })

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

  console.log(formik.values.fromDT)

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
      type: 'dateTime'
    },
    {
      field: 'responseTime',
      headerName: labels.responseTime,
      flex: 1,
      type: 'dateTime'
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
