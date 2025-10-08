import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import Form from 'src/components/Shared/Form'

export default function SizesTab({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId
  const editMode = !!recordId

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      jobItemSizes: [
        {
          id: 1,
          jobId: recordId,
          sizeId: '',
          expectedQty: 0,
          expectedPcs: 0,
          qty: 0,
          pcs: 0
        }
      ]
    },
    validationSchema: yup.object({
      jobItemSizes: yup.array().of(
        yup.object({
          sizeRef: yup.string().test(function (value) {
            if (this.options.from[1]?.value?.jobItemSizes?.length === 1) {
              return true
            }

            return !!value
          }),
          sizeName: yup.string().test(function (value) {
            if (this.options.from[1]?.value?.jobItemSizes?.length === 1) {
              return true
            }

            return !!value
          })
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedItems = obj.jobItemSizes
        .map(details => {
          return {
            ...details,
            jobId: recordId
          }
        })
        .filter(item => item.sizeRef)

      await postRequest({
        extension: ManufacturingRepository.JobItemSize.set2,
        record: JSON.stringify({ jobId: recordId, jobItemSizes: modifiedItems })
      })
      toast.success(platformLabels.Edited)
    }
  })

  const calculateTotal = fieldName => {
    return formik.values.jobItemSizes.reduce((sum, row) => {
      const value = parseFloat(row?.[fieldName]) || 0

      return sum + value
    }, 0)
  }
  const totExpectedPcs = calculateTotal('expectedPcs')
  const totExpectedQty = calculateTotal('expectedQty')
  const totPcs = calculateTotal('pcs')
  const totQty = calculateTotal('qty')

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sizeRef,
      name: 'sizeRef',
      props: {
        endpointId: InventoryRepository.ItemSizes.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        minChars: 2,
        mapping: [
          { from: 'recordId', to: 'sizeId' },
          { from: 'reference', to: 'sizeRef' },
          { from: 'name', to: 'sizeName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({
          sizeId: newRow?.sizeId,
          sizeRef: newRow?.sizeRef,
          sizeName: newRow?.sizeName
        })
      }
    },
    {
      component: 'textfield',
      label: labels.sizeName,
      name: 'sizeName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.expectedPcs,
      name: 'expectedPcs',
      props: {
        maxLength: 6
      }
    },
    {
      component: 'numberfield',
      label: labels.expectedQty,
      name: 'expectedQty',
      props: {
        maxLength: 6
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        maxLength: 6
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        maxLength: 6
      }
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobItemSize.qry,
      parameters: `_jobId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length != 0
        ? await Promise.all(
            res.list.map(async (item, index) => {
              return {
                ...item,
                id: index + 1
              }
            })
          )
        : formik.initialValues.jobItemSizes

    formik.setValues({
      jobId: recordId,
      jobItemSizes: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [recordId])

  return (
    <Form
      resourceId={ResourceIds.MFJobOrders}
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={store?.isCancelled || store?.isPosted}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('jobItemSizes', value)}
            value={formik.values.jobItemSizes}
            error={formik.errors.jobItemSizes}
            initialValues={formik?.initialValues?.jobItemSizes?.[0]}
            columns={columns}
            name='jobItemSizes'
            maxAccess={maxAccess}
            allowDelete={!store?.isPosted && !store?.isCancelled}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2} p={1}>
            <Grid item xs={3}>
              <CustomNumberField name='totExpectedPcs' label={labels.totExpectedPcs} value={totExpectedPcs} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totExpectedQty' label={labels.totExpectedQty} value={totExpectedQty} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totPcs' label={labels.totPcs} value={totPcs} readOnly />
            </Grid>
            <Grid item xs={3}>
              <CustomNumberField name='totQty' label={labels.totQty} value={totQty} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </Form>
  )
}
