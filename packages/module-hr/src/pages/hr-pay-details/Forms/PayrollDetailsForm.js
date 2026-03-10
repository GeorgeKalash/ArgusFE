import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import * as yup from 'yup'

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
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
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
