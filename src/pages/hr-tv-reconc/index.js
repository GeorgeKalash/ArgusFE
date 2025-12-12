import { useContext, useState } from 'react'
import * as yup from 'yup'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import TimeVariationReconciliationForm from './Form/TimeVariationReconciliation'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomButton from 'src/components/Inputs/CustomButton'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const TimeVariationReconciliation = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [enabled, setEnabled] = useState(false)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.TimeVariation.page,
      parameters: `_size=50&_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${
        params || ''
      }&_filter=&_sortBy=recordId`
    })

    response.list = (response?.list || []).map(record => ({
      ...record,
      clockDuration: time(record?.clockDuration),
      duration: time(record?.duration)
    }))

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    refetch,
    access,
    invalidate,
    paginationParameters,
    filterBy
  } = useResourceQuery({
    enabled,
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.TimeVariation.page,
    datasetId: ResourceIds.TimeVariationReconciliation,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      damageLevel: null,
      justification: ''
    },
    validationSchema: yup.object({}),
    onSubmit: async () => {}
  })

  function time(minutes) {
    if (minutes == 0) return '00:00'
    const absMinutes = Math.abs(minutes)
    const hours = String(Math.floor(absMinutes / 60)).padStart(2, '0')
    const mins = String(absMinutes % 60).padStart(2, '0')

    return (minutes < 0 ? '-' : '') + `${hours}:${mins}`
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'dayId',
      headerName: labels.day,
      flex: 1
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'timeName',
      headerName: labels.timeCode,
      flex: 1
    },
    {
      field: 'clockDuration',
      headerName: labels.clockDuration,
      flex: 1
    },
    {
      field: 'duration',
      headerName: labels.duration,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'damageLevelName',
      headerName: labels.damageLevel,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: TimeVariationReconciliationForm,
      props: {
        recordId: obj.recordId,
        labels,
        maxAccess: access
      },
      width: 550,
      height: 550,
      title: labels.timeVariationReconciliation
    })
  }

  const onApplyBtn = async () => {}

  const onClose = async () => {}

  const onCancel = async () => {}

  const onApply = async ({ rpbParams }) => {
    filterBy('params', rpbParams)
    setEnabled(true)
    await refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          hasSearch={false}
          maxAccess={access}
          reportName={'TATV'}
          onApply={onApply}
          sideSection={
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <ResourceComboBox
                    name='damageLevel'
                    datasetId={DataSets.DAMAGE_LEVEL}
                    label={labels.damageLevel}
                    valueField='key'
                    displayField='value'
                    required
                    values={formik.values}
                    onChange={(_, newValue) => {
                      formik.setFieldValue('damageLevel', newValue?.key || null)
                    }}
                    error={formik.touched.damageLevel && Boolean(formik.errors.damageLevel)}
                    maxAccess={access}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name='justification'
                    label={labels.justification}
                    value={formik?.values?.justification}
                    maxAccess={access}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('justification', '')}
                    error={formik.touched.justification && Boolean(formik.errors.justification)}
                  />
                </Grid>
                <Grid item>
                  <CustomButton onClick={onApplyBtn} label={platformLabels.Apply} color='#4eb558' image='apply.png' />
                </Grid>
                <Grid item>
                  <CustomButton
                    onClick={onClose}
                    label={platformLabels.Close}
                    border='1px solid #01a437'
                    color='transparent'
                    image='close.png'
                  />
                </Grid>
                <Grid item>
                  <CustomButton
                    onClick={onCancel}
                    label={platformLabels.Cancel}
                    color='#0A4164'
                    image='cancelWhite.png'
                  />
                </Grid>
                <Grid item>
                  <CustomCheckBox
                    name='showOnlyOpen'
                    value={formik.values?.showOnlyOpen}
                    onChange={event => formik.setFieldValue('showOnlyOpen', event.target.checked)}
                    label={labels.showOnlyOpen}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
          pageSize={50}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default TimeVariationReconciliation
