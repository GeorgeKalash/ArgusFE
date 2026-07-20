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
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import JobOrderWindow from '@argus/shared-ui/src/components/Shared/Forms/JobOrderWindow'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'

const JobInProcess = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { userDefaults } = useContext(DefaultsContext)
  const { checkLock } = useRecordLock()
  const { stack } = useWindow()
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

  const { formik } = useForm({
    initialValues: { workCenterId: null, workCenterName: '', workCenterRef: '', lineId: null },
    maxAccess: access,
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

        formik.setValues({ ...formik.values, workCenterId: workCenterId, workCenterName: record.name, workCenterRef: record.reference })
      }
    })()
  }, [workCenterId])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    if (formik.values.workCenterId) {
      const response = await getRequest({
        extension: ManufacturingRepository.MFJobOrder.wip,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_workCenterId=${formik.values.workCenterId}&_lineId=${formik.values.lineId || 0}&_params=`
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
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 1
    }
  ]
  async function openForm(recordId, reference) {
    const canOpen = await checkLock({
      resourceId: ResourceIds.MFJobOrders,
      recordId
    })

    if (!canOpen) return
    stack({
      Component: JobOrderWindow,
      props: {
        jobReference: reference,
        recordId,
        invalidate
      },
      nextToTitle: reference
    })
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
                  ...formik.values,
                  workCenterId: newValue?.recordId || null,
                  workCenterRef: newValue?.reference || '',
                  workCenterName: newValue?.name || ''
                })
              }}
              error={formik.touched.workCenterId && Boolean(formik.errors.workCenterId)}
            />
          </Grid>
          <Grid item xs={4}>
            <ResourceComboBox
              endpointId={ManufacturingRepository.ProductionLine.qry}
              parameters='_startAt=0&_pageSize=1000'
              values={formik.values}
              name='lineId'
              label={labels.productionLine}
              valueField='recordId'
              displayField={['reference', 'name']}
              displayFieldWidth={1}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              maxAccess={access}
              onChange={(_, newValue) => {
                formik.setFieldValue('lineId', newValue?.recordId || null)
              }}
              error={formik.touched.lineId && Boolean(formik.errors.lineId)}
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
