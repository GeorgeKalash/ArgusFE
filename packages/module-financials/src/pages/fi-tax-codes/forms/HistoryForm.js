import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const HistoryForm = ({ store, setStore, maxAccess, labels, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,

    validationSchema: yup.object({
      TaxHistoryView: yup
        .array()
        .of(
          yup.object().shape({
            amount: yup.string().required(),
            date: yup.string().required()
          })
        )
        .required(' ')
    }),

    initialValues: {
      TaxHistoryView: [
        {
          id: 1,
          taxCodeId: recordId || null,
          date: '',
          amount: '',
          seqNo: ''
        }
      ]
    },
    onSubmit: async values => {
      await postHistory(values)
    }
  })

  const postHistory = async obj => {
    const items = obj?.TaxHistoryView.map((item, index) => ({
      ...item,
      date: formatDateToApi(item.date),
      taxCodeId: recordId,
      seqNo: index + 1
    }))

    const data = {
      taxCodeId: recordId,
      items: items
    }
    await postRequest({
      extension: FinancialRepository.TaxHistoryPack.set2,
      record: JSON.stringify(data)
    })
    toast.success(platformLabels.Edited)
    setStore(prevStore => ({
      ...prevStore,
      TaxHistoryView: items
    }))
  }
  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: FinancialRepository.TaxHistoryPack.qry,
        parameters: `_taxCodeId=${recordId}`
      }).then(res => {
        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1,
            date: formatDateFromApi(item.date),
            amount: item.amount
          }))
          formik.setValues({ TaxHistoryView: items })
          setStore(prevStore => ({
            ...prevStore,
            TaxHistoryView: items
          }))
        }
      })
    }
  }, [])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.TaxCodes}
        maxAccess={maxAccess}
        isInfo={false}
        editMode={editMode}
      >
        <VertLayout>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('TaxHistoryView', value)}
              value={formik.values.TaxHistoryView}
              error={formik.errors.TaxHistoryView}
              columns={[
                {
                  component: 'date',
                  label: labels.date,
                  name: 'date'
                },
                {
                  component: 'numberfield',
                  label: labels.amount,
                  name: 'amount',
                  decimalScale: 2
                }
              ]}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    </>
  )
}

export default HistoryForm
