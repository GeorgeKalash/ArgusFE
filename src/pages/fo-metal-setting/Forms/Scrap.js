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
import { FoundryRepository } from 'src/repositories/FoundryRepository'

const ScrapForm = ({ store, maxAccess, labels }) => {
  const { recordId, metalColorId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)


  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    maxAccess,
    validationSchema: yup.object({
      scrap: yup
        .array()
        .of(
          yup.object().shape({
            sku: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      scrap:
        store?.scrap.length > 0
          ? store.scrap
          : [
              {
                id: 1,
                metalId: recordId,
                seqNo: '',
                sku: '',
                itemName: '',
                scrapItemId: ''
              }
            ]
    },
    onSubmit: async obj => {
      const items = obj?.scrap.map(({ id, ...item }) => ({
        ...item,
        metalId: recordId,
        metalColorId,
        scrapItemId: item.scrapItemId,
        seqNo: id
      }))

      const data = {
        metalId: recordId,
        metalColorId,
        metalScraps: items
      }

      const res = await postRequest({
        extension: FoundryRepository.Scrap.set2,
        record: JSON.stringify(data)
      })

      toast.success(platformLabels.Updated)
      formik.setFieldValue('recordId', res.recordId)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId && metalColorId) {
        const res = await getRequest({
          extension: FoundryRepository.Scrap.qry,
          parameters: `_metalId=${recordId}&_metalColorId=${metalColorId}`
        })

        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            scrapItemId: item.scrapItemId,
            id: index + 1
          }))

          formik.setFieldValue('scrap', items)
        }
      }
    })()
  }, [])

  const columns = [
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
          { from: 'name', to: 'itemName' },
          { from: 'recordId', to: 'scrapItemId' }
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
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.MetalSettings}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('scrap', value)}
            value={formik.values.scrap}
            error={formik.errors.scrap}
            columns={columns}
            name={'scrap'}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ScrapForm
