import React, { useEffect, useContext } from 'react'
import FormShell from './FormShell'
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

export const ApplyManual = ({ recordId, accountId, currencyId, functionId, readOnly, window }) => {
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
          amount: 0
        }
      ]
    },
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            toRecordId: yup.number().required()
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
          fromCurrencyId: currencyId
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
          { from: 'currencyId', to: 'toCurrencyId' }
        ]
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.ApplyManual}
      maxAccess={access}
      isInfo={false}
      isCleared={false}
      disabledSubmit={readOnly}
    >
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
    </FormShell>
  )
}

ApplyManual.width = 600
ApplyManual.height = 400
