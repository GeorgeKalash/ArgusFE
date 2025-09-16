import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import { DataSets } from 'src/resources/DataSets'
import { MathExpressionRepository } from 'src/repositories/MathExpressionRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const HrPenDetailForm = ({ store, maxAccess, labels, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            amount: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      damage: 1,
      items: []
    },
    onSubmit: async values => {
      const items = values?.items.map(
        ({ id, expressionName, deductionTypeName, actionName, recordId, ...item }, index) => ({
          ...item
        })
      )

      const data = {
        items: items
      }
      await postRequest({
        extension: PayrollRepository.PenaltyDetail.set2,
        record: JSON.stringify(data)
      })
      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    if (recordId) {
      ;(async function () {
        const res = await getRequest({
          extension: PayrollRepository.PenaltyDetail.qry,
          parameters: `_ptId=${recordId}&_damage=${formik.values.damage}`
        })

        formik.setFieldValue(
          'items',
          res?.list?.map((item, index) => ({
            ...item,
            id: index + 1,
            sequence: index + 1
          })) || []
        )
      })()
    }
  }, [formik.values.damage])

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'sequence'
    },
    {
      component: 'resourcecombobox',
      name: 'actionId',
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
      decimalScale: 2
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
    <VertLayout>
      <Fixed>
        <Grid container>
          <Grid item xs={4} p={2}>
            <ResourceComboBox
              name='damage'
              label={labels.damage}
              datasetId={DataSets.DAMAGE_LEVEL}
              values={formik.values}
              valueField='key'
              displayField='value'
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
          allowDelete={false}
          allowAddNewLine={false}
          maxAccess={maxAccess}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved smallBox />
      </Fixed>
    </VertLayout>
  )
}

export default HrPenDetailForm
