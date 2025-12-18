import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import { DataSets } from 'src/resources/DataSets'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { createConditionalSchema } from 'src/lib/validation'
import Form from 'src/components/Shared/Form'

export default function PayrollDetailsForm({ labels, maxAccess, store, setStore }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, seqNo } = store

  const conditions = {
    amount: row => row?.amount,
    edId: row => row?.edId,
    type: row => row?.type
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      items: [
        {
          id: 1,
          payId: recordId,
          seqNo: '',
          edSeqNo: null,
          edId: null,
          itemId: null,
          type: null,
          amount: null,
          masterId: null
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    conditionSchema: ['items'],
    onSubmit: async obj => {
      const modifiedItems = obj?.items
        ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
        .map((itemDetails, index) => {
          return {
            ...itemDetails,
            id: index + 1,
            payId: recordId,
            seqNo
          }
        })

      await postRequest({
        extension: PayrollRepository.PayrollDetails.set2,
        record: JSON.stringify({ payId: recordId, seqNo, items: modifiedItems })
      })

      setStore({
        recordId,
        seqNo
      })
      toast.success(platformLabels.Edited)
    }
  })

  const editMode = !!formik.values.recordId

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.type,
      name: 'type',
      props: {
        datasetId: DataSets.ENTITLEMENT_DEDUCTION_TYPE,
        displayField: 'value',
        valueField: 'key',
        mapping: [
          { from: 'value', to: 'typeName' },
          { from: 'key', to: 'type' }
        ]
      }
    },
    {
      component: 'resourcelookup',
      label: labels.entitlementDeduction,
      name: 'edId',
      width: 150,
      props: {
        valueField: 'reference',
        displayField: 'name',
        displayFieldWidth: 2,
        minChars: 1,
        endpointId: EmployeeRepository.EmployeeDeduction.qry,
        mapping: [
          { from: 'recordId', to: 'edId' },
          { from: 'name', to: 'edName' },
          { from: 'reference', to: 'edRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      props: {
        maxLength: 8,
        decimals: 2
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PayrollRepository.PayrollDetails.qry,
          parameters: `_payId=${recordId}&_seqNo=${seqNo}`
        })

        formik.setValues({
          items: res?.list?.map((obj, index) => ({
            id: index + 1,
            ...obj
          })),
          recordId
        })
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
