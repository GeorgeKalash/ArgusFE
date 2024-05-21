import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

const HistoryForm = ({ store, setStore, maxAccess, labels, expanded, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { height } = useWindowDimensions()

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    maxAccess,

    validationSchema: yup.object({
      TaxHistoryView: yup
        .array()
        .of(
          yup.object().shape({
            amount: yup.string().required(' '),
            date: yup.string().required(' ')
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
    onSubmit: values => {
      postHistory(values)
    }
  })

  const postHistory = obj => {
    const items = obj?.TaxHistoryView.map((item, index) => ({
      ...item,
      date: formatDateToApiFunction(item.date),
      taxCodeId: recordId,
      seqNo: index + 1
    }))

    const data = {
      taxCodeId: recordId,
      items: items
    }

    postRequest({
      extension: FinancialRepository.TaxHistoryPack.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Edited Successfully')
        setStore(prevStore => ({
          ...prevStore,
          TaxHistoryView: items
        }))
      })
      .catch(error => {})
  }

  useEffect(() => {
    const defaultParams = `_taxCodeId=${recordId}`
    var parameters = defaultParams
    recordId &&
      getRequest({
        extension: FinancialRepository.TaxHistoryPack.qry,
        parameters: `_taxCodeId=${recordId}`
      })
        .then(res => {
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
          } else {
            formik.setValues({ TaxHistoryView: [{ id: 1, taxCodeId: '', date: '', amount: '' }] })
          }
        })
        .catch(error => {})
  }, [recordId])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.TaxCodes}
        maxAccess={maxAccess}
        infoVisible={false}
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
                  maxLenght: 11,
                  decimalScale: 2
                }
              ]}
              height={`${expanded ? height - 280 : 380}px`}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    </>
  )
}

export default HistoryForm
