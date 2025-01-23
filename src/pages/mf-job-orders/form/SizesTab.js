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
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function SizesTab({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
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
          sizeRef: yup.string().required(),
          sizeName: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedItems = obj.values.jobItemSizes.map(details => {
        return {
          ...details,
          jobId: recordId
        }
      })
      await postRequest({
        extension: ManufacturingRepository.JobItemSize.set2,
        record: JSON.stringify({ jobId: recordId, data: modifiedItems })
      })
      toast.success(platformLabels.Edited)
    }
  })

  const calculateTotal = fieldName => {
    formik.values.jobItemSizes.reduce((sum, row) => {
      console.log(row?.[fieldName], 'row')
      const value = parseFloat(row?.[fieldName]) || 0
      console.log(value, 'row2', sum)

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
        valueField: 'recordId',
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
      defaultValue: 0
    },
    {
      component: 'numberfield',
      label: labels.expectedQty,
      name: 'expectedQty',
      defaultValue: 0
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      defaultValue: 0
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      defaultValue: 0
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobItemSize.qry,
      parameters: `_jobId=${recordId}`
    })

    const updateItemsList = await Promise.all(
      res?.list?.map(async (item, index) => {
        return {
          ...item,
          id: index + 1
        }
      })
    )

    formik.setValues({
      jobId: recordId,
      jobItemSizes: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      await fetchGridData()
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.MFJobOrders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('jobItemSizes', value)
              action === 'delete'
            }}
            value={formik.values.jobItemSizes}
            error={formik.errors.jobItemSizes}
            columns={columns}
            name='jobItemSizes'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container spacing={2}>
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
    </FormShell>
  )
}
