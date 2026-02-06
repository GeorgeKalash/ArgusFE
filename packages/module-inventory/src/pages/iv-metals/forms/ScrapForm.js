import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const ScrapForm = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    validationSchema: yup.object({
      scrap: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required(),
            purity: yup
              .number()
              .nullable()
              .test('is-valid-purity', function (value) {
                return !value || (value >= 0.001 && value <= 1) ? true : false
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
          metalId: recordId,
          seqNo: '',
          itemId: '',
          sku: '',
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
      metalId: recordId,
      items: items
    }

    postRequest({
      extension: InventoryRepository.Scrap.set2,
      record: JSON.stringify(data)
    }).then(res => {
      toast.success(platformLabels.Added)
    })
  }

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: InventoryRepository.Scrap.qry,
        parameters: `_metalId=${recordId}`
      }).then(res => {
        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1
          }))
          formik.setValues({ scrap: items })
        }
      })
    }
  }, [])

  return (
    <Form onSave={formik.handleSubmit} resourceId={ResourceIds.Metals} maxAccess={maxAccess} editMode={!!recordId}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('scrap', value)}
            value={formik.values.scrap}
            error={formik.errors.scrap}
            columns={[
              {
                component: 'resourcelookup',
                label: labels.sku,
                name: 'sku',
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
                  displayFieldWidth: 1
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
                  decimalScale: 2
                }
              },
              {
                component: 'numberfield',
                label: labels.purity,
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
    </Form>
  )
}

export default ScrapForm
