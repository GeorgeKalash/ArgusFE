import { useContext, useEffect, useRef } from 'react'
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

export default function RoutingTab({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const operationStore = useRef([])
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      jobId: recordId,
      routings: [
        {
          jobId: recordId,
          seqNo: '',
          name: '',
          workCenterId: '',
          operationId: '',
          status: 5,
          qty: '',
          qtyIn: '',
          pcs: '',
          pcsIn: ''
        }
      ]
    },
    validationSchema: yup.object({
      routings: yup.array().of(
        yup.object({
          seqNo: yup.string().required(),
          name: yup.string().required(),
          operationId: yup.string().required(),
          workCenterId: yup.string().required()
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedRoutings = obj.routings.map(routing => ({
        ...routing,
        seqNo: parseInt(routing.seqNo),
        status: routing.status || 5,
        jobId: recordId
      }))
      const payload = { jobId: recordId, data: modifiedRoutings }
      await postRequest({
        extension: ManufacturingRepository.JobRouting.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'seqNo',
      flex: 2,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.status == 1 || row.status == 4 }
      }
    },
    {
      component: 'textfield',
      label: labels.seqName,
      name: 'name',
      flex: 2,
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.status == 1 }
      }
    },
    {
      component: 'resourcelookup',
      label: labels.wcRef,
      name: 'workCenterRef',
      flex: 3,
      props: {
        endpointId: ManufacturingRepository.WorkCenter.snapshot,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'workCenterId' },
          { from: 'reference', to: 'workCenterRef' },
          { from: 'name', to: 'workCenterName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 3
      },
      async onChange({ row: { update, newRow } }) {
        if (!newRow?.workCenterId) {
          update({ workCenterId: '', workCenterRef: '', workCenterName: '' })

          return
        }
        update({
          workCenterId: newRow?.workCenterId,
          workCenterRef: newRow?.workCenterRef,
          workCenterName: newRow?.workCenterName
        })
        await fillOperation(newRow?.workCenterId)
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.status == 1 || row.status == 4 }
      }
    },
    {
      component: 'textfield',
      label: labels.wcName,
      name: 'workCenterName',
      flex: 3,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationName',
      flex: 3,
      props: {
        store: operationStore,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'operationId' },
          { from: 'reference', to: 'operationRef' },
          { from: 'name', to: 'operationName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      },
      propsReducer({ row, props }) {
        return { ...props, store: operationStore.current, readOnly: row.status == 1 || row.status == 4 }
      }
    },
    {
      component: 'textfield',
      label: labels.status,
      name: 'statusName',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qtyIn,
      name: 'qtyIn',
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcsIn,
      name: 'pcsIn',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        readOnly: true
      }
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobRouting.qry,
      parameters: `_jobId=${recordId}&_workcenterId=0&_status=0`
    })

    const updateRoutingList = await Promise.all(
      res?.list?.map(async (item, index) => {
        return {
          ...item,
          id: index + 1
        }
      })
    )

    formik.setValues({
      jobId: recordId,
      routings: updateRoutingList
    })
  }

  async function fillOperation(wcId) {
    if (!wcId) {
      operationStore.current = []

      return
    }

    const res = await getRequest({
      extension: ManufacturingRepository.Operation.qry,
      parameters: `_workCenterId=${wcId}&_startAt=0&_pageSize=100&`
    })
    operationStore.current = res?.list || []
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
              formik.setFieldValue('routings', value)
              action === 'delete'
            }}
            value={formik.values.routings}
            error={formik.errors.routings}
            columns={columns}
            name='routings'
            maxAccess={maxAccess}
            deleteHideCondition={[1, 4]}
            onSelectionChange={(row, update, field) => {
              if (field == 'workCenterRef') fillOperation(row?.workCenterId)
            }}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
