import { useFormik } from 'formik'
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
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const KitForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      Kit: yup
        .array()
        .of(
          yup.object().shape({
            componentId: yup.string().required(),
            qty: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      Kit: [
        {
          id: 1,
          kitId: recordId,
          muiId: '',
          componentId: '',
          componentName: '',
          componentSKU: '',
          qty: ''
        }
      ]
    },
    onSubmit: values => {
      postKit(values)
    }
  })

  const postKit = obj => {
    const Kit = obj?.Kit?.map(({ kitId, ...rest }) => ({
      kitId: recordId,
      ...rest
    }))

    const data = {
      kitId: recordId,
      users: Kit
    }
    postRequest({
      extension: InventoryRepository.Kit.set,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
        getData()
      })
      .catch(error => {})
  }

  console.log(formik.values)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.reference,
      name: 'componentSKU',
      props: {
        endpointId: InventoryRepository.Items.snapshot,
        parameters: `_startAt=0&_size=50`,
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'componentId' },
          { from: 'sku', to: 'componentSKU' },
          { from: 'name', to: 'componentName' }
        ],

        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'sku', value: 'Reference' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'componentName',
      props: {
        readOnly: true
      }
    },

    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty'
    }
  ]

  function getData() {
    getRequest({
      extension: InventoryRepository.Kit.qry,
      parameters: `_kitId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((user, index) => ({
          ...user,
          id: index + 1
        }))
        formik.setValues({ kit: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  const formik2 = useFormik({
    maxAccess,
    initialValues: {
      name: store._name || '',
      reference: store._reference
    },
    enableReinitialize: true,
    validateOnChange: true
  })

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.PointOfSale}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik2?.values?.name}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik2?.values?.reference}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('kit', value)}
            value={formik.values.kit || []}
            error={formik.errors.kit}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default KitForm
