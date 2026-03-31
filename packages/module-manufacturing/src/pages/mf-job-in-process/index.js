import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grid } from '@mui/material'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { useEffect } from 'react'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import JobOrderWindow from '../mf-job-orders/window/JobOrderWindow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { LockedScreensContext } from '@argus/shared-providers/src/providers/LockedScreensContext'
import NormalDialog from '@argus/shared-ui/src/components/Shared/NormalDialog'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

const JobInProcess = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { addLockedScreen } = useContext(LockedScreensContext)

  const { stack, lockRecord } = useWindow()
  const workCenterId = parseInt(userDefaults?.list?.find(obj => obj.key === 'workCenterId')?.value) || null

  const {
    query: { data },
    refetch,
    labels,
    access,
    invalidate,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.MFJobOrder.wip,
    datasetId: ResourceIds.JobsInProcess
  })

  const { labels: _labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.MFJobOrders
  })

  const { formik } = useForm({
    initialValues: { workCenterId: null, workCenterName: '', workCenterRef: '' },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      workCenterId: yup.number().required()
    }),
    onSubmit: () => {
      refetch()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (workCenterId) {
        const { record } = await getRequest({
          extension: ManufacturingRepository.WorkCenter.get,
          parameters: `_recordId=${workCenterId}`
        })

        formik.setValues({ workCenterId: workCenterId, workCenterName: record.name, workCenterRef: record.reference })
      }
    })()
  }, [workCenterId])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    if (formik.values.workCenterId) {
      const response = await getRequest({
        extension: ManufacturingRepository.MFJobOrder.wip,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_workCenterId=${formik.values.workCenterId}&_params=`
      })

      return { ...response, _startAt: _startAt }
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.jobRef,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'routingName',
      headerName: labels.routing,
      flex: 1
    },
    {
      field: 'designRef',
      headerName: labels.design,
      flex: 1
    },
    {
      field: 'wcName',
      headerName: labels.workCenter,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]
  function openStack(recordId, reference) {
    stack({
      Component: JobOrderWindow,
      props: {
        labels: _labels,
        access: maxAccess,
        jobReference: reference,
        recordId,
        lockRecord,
        invalidate
      },
      width: 1150,
      height: 700,
      title: _labels.jobOrder
    })
  }

  async function openForm(recordId, reference, status) {
    console.log(recordId, reference, status)
    if (recordId && status !== 3) {
      await lockRecord({
        recordId: recordId,
        reference: reference,
        resourceId: ResourceIds.MFJobOrders,
        onSuccess: () => {
          addLockedScreen({
            resourceId: ResourceIds.MFJobOrders,
            recordId,
            reference
          })
          openStack(recordId, reference)
        },
        isAlreadyLocked: name => {
          stack({
            Component: NormalDialog,
            props: {
              DialogText: `${platformLabels.RecordLocked} ${name}`,
              width: 600,
              height: 200,
              title: platformLabels.Dialog
            }
          })
        }
      })
    } else {
      openStack(recordId, reference)
    }
  }

  const edit = obj => {
    openForm(obj?.recordId, obj?.reference, obj?.status)
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={ManufacturingRepository.WorkCenter.snapshot}
              valueField='name'
              displayField='reference'
              name='workCenterId'
              label={labels.workCenter}
              valueShow='workCenterRef'
              secondValueShow='workCenterName'
              maxAccess={access}
              formObject={formik.values}
              displayFieldWidth={1.5}
              required
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              onChange={(event, newValue) => {
                formik.setValues({
                  workCenterId: newValue?.recordId || null,
                  workCenterRef: newValue?.reference || '',
                  workCenterName: newValue?.name || ''
                })
              }}
              error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton
              variant='contained'
              label={platformLabels.Preview}
              onClick={() => formik.handleSubmit()}
              color='#231f20'
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default JobInProcess
