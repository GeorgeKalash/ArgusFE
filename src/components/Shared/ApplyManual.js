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

export const ApplyManual = ({ recordId, accountId, currencyId, functionId, readOnly, window , accountRef, fromFunctionName,fromCurrencyRef}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.ApplyManual
  })

  useSetWindow({ title: platformLabels.ApplyManual, window })

  const { formik } = useForm({
    initialValues: {
      items: [
        {
          id: 1,
          fromFunctionId: functionId,
          fromRecordId: recordId,
          fromCurrencyId: currencyId,
          seqNo: 1,
          toFunctionId: null,
          toRecordId: null,
          toCurrencyId: null,
          amount: 0,
          toFunctionName: null,
          toReference: null,
          toCurrencyRef: null,
          applyAmount: 0,
          fromFunctionId: functionId,
          fromFunctionName: fromFunctionName ,
          fromCurrencyId: currencyId,
          fromCurrencyRef: fromCurrencyRef ,
          accountId: accountId ,
          accountRef: accountRef ,
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            toRecordId: yup.number().required(),
            toFunctionId: yup.number().required(),
            toCurrencyId: yup.number().required(),
            amount: yup.number().required().min(0),
            applyAmount: yup.number().required().min(0)
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const items = values.items.map((item, index) => {
        return {
          ...item,
          seqNo: index + 1,
          fromFunctionId: functionId,
          accountId,
          fromRecordId: recordId,
          fromCurrencyId: currencyId,
          fromFunctionName: fromFunctionName ,
          fromCurrencyRef: fromCurrencyRef ,
          accountId: accountId,
          accountRef: accountRef || null,
          toFunctionId:item.toFunctionId,
          toFunctionName: item.toFunctionName ,
          toRecordId: item.toRecordId,
          toReference: item.toReference ,
          toCurrencyId: item.toCurrencyId,
          toCurrencyRef: item.toCurrencyRef ,
          amount: item.amount,
          applyAmount: item.applyAmount
        }
      })

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
          { from: 'amount', to: 'amount' },
          { from: 'functionId', to: 'toFunctionId' },
          { from: 'currencyId', to: 'toCurrencyId' },
          { from: 'functionName', to: 'toFunctionName' },
          { from: 'currencyRef', to: 'toCurrencyRef' },
          { from: 'amount',     to: 'applyAmount' } 
        ]
      }
    },
    {
      component: 'numberfield',                   
      label: labels.amount,
      name: 'amount',
      props: {
        readOnly,
        thousandSeparator: false,
        decimalScale: 2,
        allowNegative: false,
        min: 0
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
