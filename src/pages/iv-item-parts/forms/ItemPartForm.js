import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grid } from '@mui/material'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const ItemPartForm = ({ labels, maxAccess, obj }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      items: yup
        .array()
        .of(
          yup.object().shape({
            qty: yup.number().test(function (value) {
              return isRowEmpty(this.parent) || value > 0
            })
          })
        )
        .required()
    }),
    initialValues: {
      itemId: obj.recordId,
      items: [
        {
          id: 1,
          partRef: '',
          partname: '',
          partId: '',
          qty: ''
        }
      ]
    },
    onSubmit: values => {
      const { items } = values

      if (items.length === 1 && isRowEmpty(items[0])) {
        postData({ itemId: values.itemId, items: [] })
      } else {
        postData(values)
      }
    }
  })

  const isRowEmpty = row => {
    return !row.partId
  }

  const postData = async obj => {
    const itemsToPost = obj?.items?.map((item, index) => ({
      ...item,
      itemId: obj.itemId,
      seqNo: index + 1
    }))

    const data = {
      itemId: obj.itemId,
      items: itemsToPost || []
    }

    await postRequest({
      extension: InventoryRepository.ItemParts.set2,
      record: JSON.stringify(data)
    })

    toast.success(platformLabels.Updated)
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.part,
      name: 'partRef',
      props: {
        valueField: 'reference',
        displayField: 'reference',
        displayFieldWidth: 2,
        endpointId: InventoryRepository.Parts.snapshot,
        mapping: [
          { from: 'recordId', to: 'partId' },
          { from: 'name', to: 'partName' },
          { from: 'reference', to: 'partRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.partName,
      name: 'partName',
      props: {
        readOnly: true,
        allowNegative: false,
        decimalScale: 0
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        allowNegative: false,
        decimalScale: 0
      }
    }
  ]

  function getData() {
    getRequest({
      extension: InventoryRepository.ItemParts.qry,
      parameters: `_itemId=${obj.recordId}`
    }).then(res => {
      const modifiedList = res.list?.map((itemPartsItem, index) => ({
        ...itemPartsItem,
        id: index + 1
      }))
      formik.setValues({
        ...formik.values,
        items: modifiedList
      })
    })
  }

  useEffect(() => {
    getData()
  }, [obj.recordId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.IVMDParts}
      isCleared={false}
      maxAccess={maxAccess}
      infoVisible={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <CustomTextField label={labels.name} value={obj.name} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label={labels.sku} value={obj.sku} readOnly />
            </Grid>
          </Grid>

          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ItemPartForm
