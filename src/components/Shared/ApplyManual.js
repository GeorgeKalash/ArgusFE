import React, { useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from './DataGrid'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import useSetWindow from 'src/hooks/useSetWindow'
import { ControlContext } from 'src/providers/ControlContext'
import Form from './Form'
import { createConditionalSchema } from 'src/lib/validation'

export const ApplyManual = ({ recordId, accountId, currencyId, functionId, readOnly, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.ApplyManual
  })

  useSetWindow({ title: platformLabels.ApplyManual, window })

  const conditions = {
    toRecordId: row => !!row?.toRecordId,
    applyAmount: row => Number(row?.applyAmount) > 0,
    toReference: row => !!row?.toReference
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, access, 'items')

  const { formik } = useForm({
    initialValues: {
      items: [
        {
          id: 1,
      toRecordId: null,
      toFunctionId: null,
      toCurrencyId: null,
      toReference: null,
      amount: 0,
      applyAmount: 0
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          schema.shape({
            applyAmount: yup
              .number()
              .typeError()
              .moreThan(0)
              .test( function (value) {
                const { amount } = this.parent
                if (value == null || isNaN(value)) return true

                return value <= (amount ?? 0)
              })
          })
        )
    }),
    onSubmit: async values => {
      const items = (values.items || [])
      .filter(row => Object.values(requiredFields).every(fn => fn(row)))
      .map(item => ({
        toReference: item.toReference,
        fromFunctionId: functionId,
        toFunctionId: item.toFunctionId,
        fromRecordId: recordId,
        toRecordId: item.toRecordId, 
        fromCurrencyId: currencyId,
        toCurrencyId: item.toCurrencyId,    
        amount: item.amount,           
        accountId: accountId,        
        applyAmount: item.applyAmount
      }
    ))

      const resultObject = {
        fromRecordId: recordId,
        fromFunctionId: functionId,
        items
      }

      await postRequest({
        extension: FinancialRepository.ApplyManual.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.toReference,
      name: 'toRecordId',
      props: {
        endpointId: FinancialRepository.AgingDoc.qry,
        parameters: `_accountId=${accountId}&_currencyId=${currencyId}`,
        displayField: 'reference',
        valueField: 'recordId',
        readOnly,
        mapping: [
          { from: 'recordId', to: 'toRecordId' },
          { from: 'reference', to: 'toReference' },
          { from: 'functionId', to: 'toFunctionId' },
          { from: 'currencyId', to: 'toCurrencyId' },
          { from: 'amount', to: 'amount' },
          { from: 'amount',     to: 'applyAmount' }
        ]
      }
    },
    {
      component: 'numberfield',                   
      label: labels.amount,
      name: 'amount',
      props: {
        readOnly: true,      
      }
    },
    {
      component: 'numberfield',
      label: labels.applyAmount,
      name: 'applyAmount',
      props: {
        decimalScale: 2,
        allowNegative: false,
        min: 0,
        maxLength: 10,
        onValidate: (value, row) => {
          const numericValue = Number(value)
          if (numericValue <= 0) {

            return 0
          }
          if (numericValue > Number(row.amount)) {
            return row.amount
          }
          
          return numericValue

        }
      }
    }
  ]

  const fetchData = async () => {
    if (recordId && functionId) {
      const res = await getRequest({
        extension: FinancialRepository.ApplyManual.qry,
        parameters: `_fromFunctionId=${functionId}&_fromRecordId=${recordId}`
      })

      formik.setFieldValue(
        'items',
        res?.list?.map((item, index) => ({
          id: index + 1,
          ...item
        })) || []
      )
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} disabledSubmit={readOnly} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='applyManual'
            onChange={value => {
              formik.setFieldValue('items', value)
            }}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            allowAddNewLine={!readOnly}
            allowDelete={!readOnly}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

ApplyManual.width = 600
ApplyManual.height = 400
