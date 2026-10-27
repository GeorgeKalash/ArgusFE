import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ClearGridConfirmation from '@argus/shared-ui/src/components/Shared/ClearGridConfirmation'

const WorkCenterWorkForceForm = ({ recordId, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const initialValues = {
    workCenterId: recordId || '',
    fiscalYear: null,
    items: []
  }

  const { formik } = useForm({
    validateOnChange: true,
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      items: yup.array().of(
        yup.object().shape({
          qty: yup.number().nullable(),
          headCount: yup.number().nullable(),
          machinesCount: yup.number().nullable()
        })
      )
    }),
    initialValues,
    onSubmit: values => postData(values)
  })

  const postData = async values => {
    const items = (values.items || []).map(row => ({
      workCenterId: recordId,
      fiscalYear: values.fiscalYear,
      periodId: row.periodId,
      qty: row.qty || 0,
      headCount: row.headCount || 0,
      machinesCount: row.machinesCount || 0
    }))

    const data = {
      workCenterId: recordId,
      fiscalYear: values.fiscalYear,
      items
    }

    await postRequest({
      extension: ManufacturingRepository.WorkCenterWorkForce.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Edited)
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.period,
      name: 'periodName',
      props: { readOnly: true }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty'
    },
    {
      component: 'numberfield',
      label: labels.headCount,
      name: 'headCount',
      props: { decimalScale: 0 }
    },
    {
      component: 'numberfield',
      label: labels.machinesCount,
      name: 'machinesCount',
      props: { decimalScale: 0 }
    }
  ]

  async function fillGrid(fiscalYear, { clear = false } = {}) {
    if (!fiscalYear) {
      formik.setFieldValue('items', [])
      return
    }

    const periodsRequest = getRequest({
      extension: SystemRepository.Period.qry,
      parameters: `_fiscalYear=${fiscalYear}`
    })

    const workForceRequest = clear
      ? Promise.resolve(null)
      : getRequest({
          extension: ManufacturingRepository.WorkCenterWorkForce.qry,
          parameters: `_workCenterId=${recordId}&_fiscalYear=${fiscalYear}`
        })

    const [periodsRes, workForceRes] = await Promise.all([periodsRequest, workForceRequest])

    const workForceByPeriod = new Map((workForceRes?.list || []).map(item => [item.periodId, item]))

    const rows = (periodsRes?.list || []).map((period, index) => {
      const saved = workForceByPeriod.get(period.periodId)

      return {
        id: index + 1,
        workCenterId: recordId,
        fiscalYear: fiscalYear,
        periodId: period.periodId,
        periodName: period.periodName,
        qty: saved?.qty ?? 0,
        headCount: saved?.headCount ?? 0,
        machinesCount: saved?.machinesCount ?? 0
      }
    })

    formik.setFieldValue('items', rows)
  }

  const onClearGridConfirmation = async () => {
    stack({
      Component: ClearGridConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        onConfirm: () => {
          fillGrid(formik?.values?.fiscalYear, { clear: true })
        },
        dialogText: platformLabels.DeleteGridConf
      }
    })
  }

  const actions = [
    {
      key: 'ClearGrid',
      condition: true,
      onClick: onClearGridConfirmation,
      disabled: !formik.values.fiscalYear
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.WorkCenterWorkForce}
      isCleared={false}
      isInfo={false}
      maxAccess={maxAccess}
      disabledSubmit={!formik.values.fiscalYear}
      editMode={true}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2} sx={{ pb: 2 }}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                readOnly={formik.values.fiscalYear != null}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  const year = newValue?.fiscalYear || null
                  formik.setFieldValue('fiscalYear', year)
                  fillGrid(year)
                }}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items || []}
            error={formik.errors.items}
            allowDelete={false}
            allowAddNewLine={false}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default WorkCenterWorkForceForm