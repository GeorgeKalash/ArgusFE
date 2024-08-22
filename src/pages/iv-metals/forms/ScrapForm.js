import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { ControlContext } from 'src/providers/ControlContext'

const ScrapForm = ({ store, setStore, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    maxAccess,
    validationSchema: yup.object({
      scrap: yup
        .array()
        .of(
          yup.object().shape({
            laborValuePerGram: yup
              .number()
              .nullable()
              .test('is-valid-reportingPurity', function (value) {
                if (!value) return true
                return value >= 0.001 && value <= 1
              }),
            purity: yup
              .number()
              .nullable()
              .test('is-valid-reportingPurity', function (value) {
                if (!value) return true
                return value >= 0.001 && value <= 1
              })
          })
        )
        .required()
    }),

    initialValues: {
      recordId: recordId,
      scrap: [
        {
          id: 1,
          metalId: recordId || null,
          seqNo: '',
          itemId: '',
          itemName: '',
          laborValuePerGram: '',
          purity: ''
        }
      ]
    },
    onSubmit: values => {
      postScrap(values)
    }
  })

  const postScrap = obj => {
    const items = obj?.scrap.map(({ id, ...item }) => ({
      ...item,
      metalId: recordId,
      seqNo: id
    }))

    const data = {
      taxCodeId: recordId,
      metalId: recordId,
      items: items
    }

    postRequest({
      extension: InventoryRepository.Scrap.set,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Added)
        setStore(prevStore => ({
          ...prevStore,
          scrap: items
        }))
      })
      .catch(error => {})
  }

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: InventoryRepository.Scrap.qry,
        parameters: `_metalId=${recordId}`
      })
        .then(res => {
          if (res?.list?.length > 0) {
            const items = res.list.map((item, index) => ({
              ...item,
              id: index + 1
            }))

            formik.setValues({ scrap: items })
          }
        })
        .catch(error => {})
    }
  }, [])

  return (
    <>
      <FormShell
        form={formik}
        resourceId={ResourceIds.TaxCodes}
        maxAccess={maxAccess}
        infoVisible={true}
        editMode={!!recordId}
        isCleared={false}
      >
        <VertLayout>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('scrap', value)}
              value={formik.values.scrap}
              error={formik.errors.scrap}
              columns={[
                {
                  component: 'resourcecombobox',
                  label: labels.sku,
                  name: 'itemId',
                  props: {
                    endpointId: InventoryRepository.Item.snapshot,
                    valueField: 'recordId',
                    displayField: 'sku',
                    mapping: [
                      { from: 'recordId', to: 'itemId' },
                      { from: 'sku', to: 'sku' },
                      { from: 'name', to: 'itemName' }
                    ],
                    columnsInDropDown: [
                      { key: 'sku', value: 'SKU' },
                      { key: 'name', value: 'Name' }
                    ],
                    displayFieldWidth: 2
                  }
                },
                {
                  component: 'textfield',
                  label: labels.itemName,
                  name: 'itemName',
                  props: {
                    readOnly: true
                  }
                },
                {
                  component: 'numberfield',
                  label: labels.LaborValuePerGram,
                  name: 'laborValuePerGram',
                  props: {
                    maxLength: 6,
                    decimalScale: 5
                  }
                },
                {
                  component: 'numberfield',
                  label: labels.amount,
                  name: 'purity',
                  props: {
                    maxLength: 6,
                    decimalScale: 5
                  }
                }
              ]}
            />
          </Grow>
        </VertLayout>
      </FormShell>
    </>
  )
}

export default ScrapForm
