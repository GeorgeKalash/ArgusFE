import { useState, useContext } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grid } from '@mui/material'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import DataForm from '@argus/shared-ui/src/components/Shared/DataForm'

const TrxDetails = () => {
  const [data, setData] = useState([])
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const formatDate = date => {
    const d = date
    const month = d?.getMonth() + 1
    const day = d?.getDate()
    const year = d?.getFullYear()

    return `${month}-${day}-${year}`
  }

  const fetchData = () => {
    const formattedstartDate = formatDate(formik.values.startDate)
    const formattedendDate = formatDate(formik.values.endDate)
    getRequest({
      extension: SystemRepository.TrxDetails.qry2,
      parameters: `_countryId=${formik.values.countryId}&_moduleId=${formik.values.moduleId || 0}&_resourceId=${
        formik.values.resourceId || 0
      }&_userId=${formik.values.userId || 0}&_trxType=${formik.values.trxType || 0}&_data=${
        formik.values.data || 0
      }&_startDate=${formattedstartDate}&_endDate=${formattedendDate}`
    }).then(response => {
      setData(response)
    })
  }

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.TransactionLog
  })

  const initialStartDate = new Date()
  initialStartDate.setHours(0, 0, 0, 0)

  const { formik } = useForm({
    initialValues: {
      countryId: 0,
      currencyId: '',
      resourceId: '',
      data: '',
      moduleId: '',
      trxType: '',
      userId: '',
      startDate: initialStartDate,
      endDate: initialStartDate
    },
    access,
    validateOnChange: true
  })

  const columns = [
    {
      field: 'eventDt',
      headerName: labels.eventDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'userName',
      headerName: labels.userName,
      flex: 1
    },
    {
      field: 'ttName',
      headerName: labels.ttName,
      flex: 1
    },
    {
      field: 'resourceName',
      headerName: labels.resourceName,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    const res = await getRequest({
      extension: SystemRepository.TrxDetails.get,
      parameters: `_recordId=${obj.recordId}`
    })

    stack({
      Component: DataForm,
      props: {
        obj,
        data: JSON.parse(res?.record?.data || '{}')
      },
      expandable: false
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} p={2}>
          <Grid item xs={3}>
            <CustomDatePicker
              name='startDate'
              max={formik.values.endDate}
              label={labels.startDate}
              value={formik?.values?.startDate}
              onChange={formik.setFieldValue}
              onClear={() => formik.setFieldValue('startDate', '')}
              error={!formik.values.startDate}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <ResourceComboBox
              datasetId={DataSets.MODULE}
              name='moduleId'
              label={labels.module}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('moduleId', newValue?.key || null)
                !newValue && formik.setFieldValue('resourceId', null)
              }}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <ResourceComboBox
              endpointId={SystemRepository.ModuleClassRES.qry}
              parameters={`_moduleId=${formik.values.moduleId || 0}&_filter=`}
              label={'ResourceId'}
              name='resourceId'
              values={formik.values}
              readOnly={!formik.values.moduleId}
              valueField='key'
              displayField='value'
              onChange={(event, newValue) => {
                formik.setFieldValue('resourceId', newValue?.key || null)
              }}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3}>
            <CustomDatePicker
              name='endDate'
              min={formik.values.startDate}
              label={labels.endDate}
              value={formik?.values?.endDate}
              onChange={formik.setFieldValue}
              onClear={() => formik.setFieldValue('endDate', null)}
              error={!formik.values.endDate}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='data'
              label={labels.data}
              value={formik.values.data}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('data', null)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <ResourceComboBox
              datasetId={DataSets.TRX_TYPE}
              name='trxType'
              label={labels.ttype}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('trxType', newValue?.key || null)
              }}
            />
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={SystemRepository.Users.snapshot}
              valueField='username'
              displayField='email'
              name='userId'
              label={labels.users}
              form={formik}
              displayFieldWidth={2}
              valueShow='username'
              secondValueShow='email'
              onChange={(event, newValue) => {
                formik.setFieldValue('userId', newValue ? newValue.recordId : '')
                formik.setFieldValue('email', newValue ? newValue.email : '')
                formik.setFieldValue('username', newValue ? newValue.username : '')
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton
              onClick={() => {
                if (formik.values.startDate && formik.values.endDate) {
                  fetchData()
                }
              }}
              image={'preview.png'}
              tooltipText={platformLabels.Preview}
            />
          </Grid>
          <Grid item xs={6}></Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default TrxDetails
