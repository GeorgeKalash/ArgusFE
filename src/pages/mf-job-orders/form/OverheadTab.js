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

export default function OverheadTab({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      items: [
        {
          id: 1,
          jobId: recordId,
          overheadId: '',
          seqNo: '',
          amount: 0,
          units: 0,
          unitCost: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          overheadRef: yup.string().required(),
          overheadName: yup.string().required(),
          units: yup.number().min(1)
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items.map((details, index) => {
        return {
          ...details,
          seqNo: index + 1,
          jobId: recordId
        }
      })
      const payload = { jobId: recordId, items: modifiedItems }
      await postRequest({
        extension: ManufacturingRepository.JobOverhead.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const totAmount = formik.values.items.reduce((amountSum, row) => {
    const amountValue = parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0

    return amountSum + amountValue
  }, 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.overheadRef,
      name: 'overheadRef',
      props: {
        endpointId: ManufacturingRepository.Overhead.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'overheadId' },
          { from: 'reference', to: 'overheadRef' },
          { from: 'name', to: 'overheadName' },
          { from: 'unitCost', to: 'unitCost' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({
          overheadId: newRow?.overheadId,
          overheadRef: newRow?.overheadRef,
          overheadName: newRow?.overheadName,
          unitCost: newRow?.unitCost || 0
        })
      }
    },
    {
      component: 'textfield',
      label: labels.overheadName,
      name: 'overheadName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.units,
      name: 'units',
      defaultValue: 0,
      async onChange({ row: { update, newRow } }) {
        update({ amount: newRow?.units * newRow?.unitCost || 0 })
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    }
  ]

  const actions = [
    {
      key: 'GenerateJob',
      condition: true,
      onClick: generateOVH
    }
  ]

  async function generateOVH() {
    await postRequest({
      extension: ManufacturingRepository.JobOverhead.generate,
      record: JSON.stringify({ jobId: recordId })
    })
    toast.success(platformLabels.Generated)
    await fetchGridData()
  }

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOverhead.qry,
      parameters: `_jobId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length != 0
        ? await Promise.all(
            res?.list?.map(async (item, index) => {
              return {
                ...item,
                id: index + 1
              }
            })
          )
        : [{ id: 1 }]

    formik.setValues({
      jobId: recordId,
      items: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.MFJobOrders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isSavedClear={false}
      actions={actions}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={(value, action) => {
              formik.setFieldValue('items', value)
              action === 'delete'
            }}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
          />
        </Grow>
        <Fixed>
          <Grid container>
            <Grid item xs={2}>
              <CustomNumberField name='totalAmount' label={labels.total} value={totAmount} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
