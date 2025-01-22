import { useContext, useEffect, useRef, useState } from 'react'
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
      const modifiedItems = obj.values.items.map((details, index) => {
        return {
          ...details,
          seqNo: index + 1,
          jobId: recordId
        }
      })
      const payload = { jobId: recordId, data: modifiedItems }
      await postRequest({
        extension: ManufacturingRepository.JobOverhead.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

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
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.workCenterId) {
          update({
            overheadId: '',
            overheadRef: '',
            overheadName: '',
            unitCost: ''
          })

          return
        }
        update({
          overheadId: newRow?.overheadId,
          overheadRef: newRow?.overheadRef,
          overheadName: newRow?.overheadName,
          unitCost: newRow?.unitCost
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
      defaultValue: 0
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

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOverhead.qry,
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
      items: updateItemsList
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
      isCleared={false}
      isSavedClear={false}
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
      </VertLayout>
    </FormShell>
  )
}
