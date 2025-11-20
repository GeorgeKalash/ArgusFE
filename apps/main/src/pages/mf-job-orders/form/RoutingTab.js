import { useContext, useEffect, useRef, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/repositories/ManufacturingRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function RoutingTab({ labels, maxAccess, store, refetchRouting, setRefetchRouting }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const operationStore = useRef([])
  const [allWorkCenters, setWorkCenters] = useState([])
  const { recordId, jobReference } = store
  const editMode = !!recordId

  const { formik } = useForm({
    initialValues: {
      jobId: recordId,
      jobReference,
      routings: [
        {
          id: 1,
          jobId: null,
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
          operationName: yup.string().required(),
          workCenterRef: yup.string().required(),
          workCenterName: yup.string().required()
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
      await postRequest({
        extension: ManufacturingRepository.JobRouting.set2,
        record: JSON.stringify({ jobId: recordId, data: modifiedRoutings })
      })
      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'numberfield',
      label: labels.seqNo,
      name: 'seqNo',
      flex: 1,
      props: {
        unClearable: true
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: [1, 2, 3, 4].includes(row.status) }
      }
    },
    {
      component: 'textfield',
      label: labels.seqName,
      name: 'name',
      flex: 2,
      propsReducer({ row, props }) {
        return { ...props, readOnly: [1, 2, 3, 4].includes(row.status) }
      }
    },
    {
      component: 'resourcelookup',
      label: labels.wcRef,
      name: 'workCenterRef',
      flex: 2,
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
          update({
            workCenterId: '',
            workCenterRef: '',
            workCenterName: '',
            operationId: '',
            operationRef: '',
            operationName: ''
          })

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
        return { ...props, readOnly: [1, 2, 3, 4].includes(row.status) }
      }
    },
    {
      component: 'textfield',
      label: labels.wcName,
      name: 'workCenterName',
      flex: 2.7,
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.operation,
      name: 'operationName',
      flex: 2,
      props: {
        store: operationStore?.current,
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
        return {
          ...props,
          store: operationStore.current,
          readOnly: [1, 2, 3, 4].includes(row.status)
        }
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
      flex: 1,
      name: 'qtyIn',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcsIn,
      flex: 1,
      name: 'pcsIn',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      flex: 1,
      name: 'qty',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      flex: 1,
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

    const updateRoutingList =
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
      jobReference,
      routings: updateRoutingList
    })
  }

  async function fillOperation(wcId) {
    operationStore.current = []
    const currentWc = allWorkCenters?.find(wc => parseInt(wc.workCenterId) === wcId)
    if (currentWc) operationStore.current = [currentWc]
  }

  async function fetchAllWorkCenters() {
    const res = await getRequest({
      extension: ManufacturingRepository.Operation.qry,
      parameters: `_workCenterId=${0}&_startAt=0&_pageSize=1000&`
    })
    setWorkCenters(res?.list)
  }

  useEffect(() => {
    ;(async function () {
      if (!refetchRouting || !recordId) return
      await fetchGridData()
      await fetchAllWorkCenters()
      setRefetchRouting(false)
    })()
  }, [recordId, refetchRouting])

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={editMode}
      disabledSubmit={store?.isCancelled || store?.isPosted}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <CustomTextField value={formik.values.jobReference} label={labels.reference} readOnly />
            </Grid>
          </Grid>
        </Fixed>
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
            allowDelete={!store?.isPosted && !store?.isCancelled}
            deleteHideCondition={{ status: [1, 2, 3, 4] }}
            onSelectionChange={(row, update, field) => {
              if (field == 'operationName') fillOperation(row?.workCenterId)
            }}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
