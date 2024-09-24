import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { DataSets } from 'src/resources/DataSets'

const DetailsForm = ({ store, setStore, maxAccess, labels, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    maxAccess,
    initialValues: {
      TaxDetail: [
        {
          id: 1,
          taxId: recordId || null,
          taxCodeId: '',
          taxBase: '',
          amount: '',
          taxCodeName: '',
          seqNo: ''
        }
      ]
    },
    validationSchema: yup.object({
      TaxDetail: yup
        .array()
        .of(
          yup.object().shape({
            amount: yup.string().required(' '),
            taxBase: yup.string().required(' '),

            taxCodeId: yup.string().required(' ')
          })
        )
        .required(' ')
    }),

    onSubmit: async values => {
      await postHistory(values)
    }
  })

  const postHistory = async obj => {
    const items = obj?.TaxDetail.map((item, index) => ({
      ...item,

      taxId: recordId,
      seqNo: index + 1
    }))

    const data = {
      taxId: recordId,
      items: items
    }

    await postRequest({
      extension: FinancialRepository.TaxDetailPack.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success('Record Edited Successfully')
        setStore(prevStore => ({
          ...prevStore,
          TaxDetail: items
        }))
      })
      .catch(error => {})
  }

  useEffect(() => {
    const defaultParams = `_taxId=${recordId}`
    var parameters = defaultParams
    if (recordId) {
      getRequest({
        extension: FinancialRepository.TaxDetailPack.qry,
        parameters: `_taxId=${recordId}`
      })
        .then(res => {
          if (res?.list?.length > 0) {
            const items = res.list.map((item, index) => ({
              ...item,
              id: index + 1,
              taxCodeId: item.taxCodeId,
              taxBase: item.taxBase,
              amount: item.amount,
              taxCodeName: item.taxCodeName
            }))
            formik.setValues({ TaxDetail: items })
            setStore(prevStore => ({
              ...prevStore,
              TaxDetail: items
            }))
          }
        })
        .catch(error => {})
    }
  }, [])

  return (
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
            onChange={value => formik.setFieldValue('TaxDetail', value)}
            value={formik.values.TaxDetail}
            error={formik.errors.TaxDetail}
            columns={[
              {
                component: 'resourcecombobox',
                label: labels.taxCode,
                name: 'taxCodeId',
                props: {
                  endpointId: FinancialRepository.TaxCodes.qry,
                  displayField: 'name',
                  valueField: 'recordId',
                  mapping: [
                    { from: 'recordId', to: 'taxCodeId' },

                    { from: 'name', to: 'taxCodeName' }
                  ],
                  columnsInDropDown: [
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]
                }
              },
              {
                component: 'resourcecombobox',
                label: labels.taxBase,
                name: 'taxBase',
                props: {
                  datasetId: DataSets.FI_TAX_BASE,
                  displayField: 'value',
                  valueField: 'key',
                  mapping: [
                    { from: 'value', to: 'taxBaseName' },
                    { from: 'key', to: 'taxBase' }
                  ]
                }
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
  )
}

export default DetailsForm
