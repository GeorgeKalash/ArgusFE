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
import { useInvalidate } from 'src/hooks/resource'
import { createConditionalSchema } from 'src/lib/validation'
import { PayrollRepository } from 'src/repositories/PayrollRepository'

const CompanyForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.IndemnityCompany.page
  })

  const conditions = {
    from: row => (row?.from != 0 && row?.from < row?.to) || (!row?.from && row?.to),
    to: row => (row?.to != 0 && row?.from < row?.to) || (!row?.to && row?.from),
    pct: row => row?.pct != null && row?.pct <= 100
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    initialValues: { items: [] },
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const payload = {
        inId: recordId,
        items: values.items
          ?.filter(row => Object.values(requiredFields)?.some(fn => fn(row)))
          .map((row, index) => ({
            ...row,
            inId: recordId,
            seqNo: index + 1
          }))
      }

      await postRequest({
        extension: PayrollRepository.IndemnityCompany.set2,
        record: JSON.stringify(payload)
      })

      toast.success(platformLabels.Updated)
      invalidate()
    }
  })

  const getGridData = async () => {
    const res = await getRequest({
      extension: PayrollRepository.IndemnityCompany.qry,
      parameters: `_inId=${recordId}`
    })
    if (res.list?.length) {
      formik.setValues({
        items: res.list.map((obj, index) => ({
          id: index + 1,
          ...obj
        }))
      })
    }
  }

  useEffect(() => {
    if (recordId) getGridData()
  }, [recordId])

  const columns = [
    {
      component: 'numberfield',
      label: labels.from,
      name: 'from'
    },
    {
      component: 'numberfield',
      label: labels.to,
      name: 'to'
    },
    {
      component: 'numberfield',
      label: labels.percentage,
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
          name='items'
          maxAccess={maxAccess}
          value={formik.values.items}
          error={formik.errors?.items}
          columns={columns}
          onChange={value => formik.setFieldValue('items', value)}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved smallBox />
      </Fixed>
    </VertLayout>
  )
}

export default CompanyForm
