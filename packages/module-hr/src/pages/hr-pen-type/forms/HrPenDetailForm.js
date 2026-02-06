import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { MathExpressionRepository } from '@argus/repositories/src/repositories/MathExpressionRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const HrPenDetailForm = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    amount: row => row?.amount != null,
    actionName: row => row?.actionName,
    deductionType: row => row?.deductionType,
    expressionId: row => row?.expressionId
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['items'],
    validationSchema: yup.object({
      damage: yup.number().required(),
      items: yup.array().of(schema)
    }),
    initialValues: {
      damage: 1,
      items: [{ id: 1 }]
    },
    onSubmit: async values => {
      const items = values?.items
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map(({ id, expressionName, deductionTypeName, actionName, ...rest }, index) => ({
          ...rest,
          sequence: index + 1,
          damage: values.damage,
          ptId: recordId
        }))

      await postRequest({
        extension: PayrollRepository.PenaltyDetail.set2,
        record: JSON.stringify({
          ...values,
          ptId: recordId,
          items
        })
      })
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    if (recordId) {
      ;(async function () {
        if (formik.values.damage) {
          const res = await getRequest({
            extension: PayrollRepository.PenaltyDetail.qry,
            parameters: `_ptId=${recordId}&_damage=${formik.values.damage}`
          })

          formik.setFieldValue(
            'items',
            res.list?.length > 0
              ? res?.list?.map((item, index) => ({
                  ...item,
                  id: index + 1
                }))
              : formik.initialValues.items
          )
        } else {
          formik.setFieldValue('items', formik.initialValues.items)
        }
      })()
    }
  }, [formik.values.damage])

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'actionName',
      label: labels.action,
      props: {
        datasetId: DataSets.PENALTY_DETAIL_ACTION,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'action' },
          { from: 'value', to: 'actionName' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      name: 'deductionType',
      label: labels.deductionType,
      props: {
        datasetId: DataSets.DEDUCTION_TYPE,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 2,
        mapping: [
          { from: 'key', to: 'deductionType' },
          { from: 'value', to: 'deductionTypeName' }
        ]
      }
    },
    {
      component: 'numberfield',
      label: labels.deductionAmount,
      name: 'amount',
      props: {
        allowNegative: false,
        maxLength: 10
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.expression,
      name: 'expressionId',
      props: {
        endpointId: MathExpressionRepository.Expression.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'name', to: 'expressionName' },
          { from: 'recordId', to: 'expressionId' }
        ]
      }
    },
    {
      component: 'checkbox',
      name: 'includeTV',
      label: labels.includeHourSalary
    }
  ]

  return (
    <Form maxAccess={maxAccess} onSave={formik.handleSubmit}>
      <VertLayout>
        <Fixed>
          <Grid container>
            <Grid item xs={4}>
              <ResourceComboBox
                name='damage'
                label={labels.damage}
                datasetId={DataSets.DAMAGE_LEVEL}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('damage', newValue?.key || null)
                }}
                error={formik.touched.damage && Boolean(formik.errors.damage)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            name='items'
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default HrPenDetailForm
