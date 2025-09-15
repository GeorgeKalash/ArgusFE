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
    endpointId: SaleRepository.CommissionScheduleBracket.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: { rows: [] },
    validationSchema: yup.object({
      rows: yup.array().of(
        yup.object({
          minAmount: yup.number().test(function (value) {
            const { maxAmount, pct } = this.parent
            const isAnyFilled = value != null || maxAmount != null || pct != null

            if (!isAnyFilled) return true

            return value != null
          }),
          maxAmount: yup.number().test('max-greater-than-min', 'Max must be greater than Min', function (value) {
            const { minAmount, pct } = this.parent
            const isAnyFilled = minAmount != null || value != null || pct != null

            if (!isAnyFilled) return true
            if (value == null) return false

            return Number(value) >= Number(minAmount)
          }),
          pct: yup.number().test(function (value) {
            const { minAmount, maxAmount } = this.parent
            const isAnyFilled = minAmount != null || maxAmount != null || value != null

            if (!isAnyFilled) return true
            if (value == null) return false

            return value >= 0.01 && value <= 100
          })
        })
      )
    }),
    onSubmit: async values => {
      const filteredRows = values.rows.filter(row => row.minAmount != null || row.maxAmount != null || row.pct != null)

      const updatedRows = filteredRows.map((row, index) => ({
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
    if (recordId) getGridData()
  }, [recordId])

  const columns = [
    {
      component: 'numberfield',
      label: labels.min,
      name: 'minAmount',
      props: {
        allowNegative: false
      }
    },
    {
      component: 'numberfield',
      label: labels.max,
      name: 'maxAmount',
      props: {
        allowNegative: false
      }
    },
    {
      component: 'numberfield',
      label: labels.pct,
      name: 'pct',
      props: {
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
          name='rows'
          maxAccess={maxAccess}
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
