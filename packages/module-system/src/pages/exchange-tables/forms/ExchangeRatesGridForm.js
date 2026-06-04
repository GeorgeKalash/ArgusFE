import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { formatDateToSlashDate, formatDateToYYYYMMDD } from '@argus/shared-domain/src/lib/date-helper'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

export default function ExchangeRatesGridForm({ labels, maxAccess, store }) {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: MultiCurrencyRepository.ExchangeTable.page
  })

  const conditions = {
    dayId: row => row?.dayId,
    rate: row => row?.rate
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'rows')
  

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      rows: [{
        id: 1,
        exId: recordId || null,
        seqNo: 0,
        dayId: null,
        rate: ''
      }]
    },
    conditionSchema: ['rows'],
    validationSchema: yup.object({
      rows: yup.array().of(schema)
    }),
    onSubmit: async values => {
      await postRequest({
        extension: MultiCurrencyRepository.ExchangeRates.set2,
        record: JSON.stringify({
          exId: recordId,
          items: values.rows.filter(row => Object.values(requiredFields)?.every(fn => fn(row))).map((row, index) => ({
            ...row,
            exId: recordId,
            seqNo: index + 1,
            dayId: formatDateToYYYYMMDD(row.dayId),
          }))
        })
      })

      toast.success(platformLabels.Edited)
      invalidate()
    }
  })

  const columns = [
    {
      component: 'date',
      label: labels.stDate,
      name: 'dayId',
      flex: 1
    },
    {
      component: 'numberfield',
      label: labels.rate,
      name: 'rate',
      flex: 1,
      props: {
        decimalScale: 7,
        maxLength: 18
      }
    }
  ]

    useEffect(() => {
      ;(async function () {
        if (!recordId) return

        const res = await getRequest({
          extension: MultiCurrencyRepository.ExchangeRates.qry2,
          parameters: `_exId=${recordId}`
        })

        formik.setValues({
          rows: res?.list.length ? res?.list.map((row, index) => ({
            ...row,
            id: index + 1,
            exId: recordId,
            dayId: row.dayId ? new Date(formatDateToSlashDate(row.dayId)) : null
          })) : formik.initialValues.rows
        })
      })()
    }, [recordId])

  const editMode = !!store.recordId

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            initialValues={formik.initialValues.rows?.[0]}
             onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}