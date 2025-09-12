import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { useInvalidate } from 'src/hooks/resource'

const BracketsForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: SaleRepository.CommissionScheduleBracket.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: { rows: [] },
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          minAmount: yup.number().typeError('Must be a number').required('Required'),
          maxAmount: yup
            .number()
            .typeError('Must be a number')
            .required('Required')
            .test('max-greater-than-min', 'Max must be greater than Min', function (value) {
              const { minAmount } = this.parent
              if (minAmount == null || value == null) return true

              return Number(value) >= Number(minAmount)
            }),
          pct: yup
            .number()
            .nullable()
            .min(0.01, ' must be greater than 0')
            .max(100, ' must be less than or equal to 100')
        })
      )
    }),
    onSubmit: async values => {
      const updatedRows = values.rows.map((row, index) => ({
        ...row,
        commissionScheduleId: recordId,
        seqNo: index + 1
      }))

      const payload = {
        commissionScheduleId: recordId,
        items: updatedRows
      }

      await postRequest({
        extension: SaleRepository.CommissionSchedule.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)
      invalidate()
    }
  })

  const getGridData = async () => {
    const res = await getRequest({
      extension: SaleRepository.CommissionScheduleBracket.qry,
      parameters: `_commissionScheduleId=${recordId}`
    })
    if (res.list.length > 0) {
      const newRows = res.list.map((obj, index) => {
        return {
          id: index + 1,
          ...obj
        }
      })

      formik.setValues({ rows: newRows })
    }
  }

  useEffect(() => {
    getGridData()
  }, [])

  const columns = [
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minAmount',
      props: { required: true }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxAmount',
      props: { required: true }
    },
    {
      component: 'numberfield',
      label: labels.pct,
      name: 'pct',
      props: {
        required: true,
        allowNegative: false,
        maxLength: 5,
        decimalScale: 2
      }
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          value={formik.values.rows}
          error={formik.errors?.rows}
          columns={columns}
          onChange={value => formik.setFieldValue('rows', value)}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved smallBox />
      </Fixed>
    </VertLayout>
  )
}

export default BracketsForm
