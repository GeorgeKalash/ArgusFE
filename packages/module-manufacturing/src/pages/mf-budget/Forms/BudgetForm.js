import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'

export default function BudgetForm ({ labels, record, recordId, maxAccess, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const {fiscalYear, periodId, seqNo} = record
  
  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Budget.page
  })
  
  const { formik } = useForm({
    initialValues: {
      recordId,
      fiscalYear: null,
      periodId: null,
      seqNo: 0,
      metalId: null,
      itemGroupId: null,
      collectionId: null,
      qtyPct: 0
    },
    maxAccess,
    validationSchema: yup.object({
      fiscalYear: yup.number().required(),
      periodId: yup.number().required(),
      metalId: yup.number().required(),
      itemGroupId: yup.number().required(),
      collectionId: yup.number().required(),
      qtyPct: yup.number().required().max(100),
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: ManufacturingRepository.Budget.set,
        record: JSON.stringify(obj)
      })
      toast.success(!recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
     }
    })

  async function refetchForm () {
    const res = await getRequest({
      extension: ManufacturingRepository.Budget.get,
      parameters: `_fiscalYear=${fiscalYear}&_periodId=${periodId}&_seqNo=${seqNo}`
    })

    formik.setValues({
      ...res?.record || {},
      recordId
     }
    )
  }

  useEffect(() => {
    if (record && fiscalYear && periodId && seqNo && recordId) refetchForm()
  }, [])

  const editMode = !!formik.values.recordId
  
  return (
    <FormShell
      resourceId={ResourceIds.Budget}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('fiscalYear', newValue?.fiscalYear)}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='periodId'
                label={labels.period}
                valueField='periodId'
                displayField='name'
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('periodId', newValue?.periodId || null)}
                error={formik.touched.periodId && Boolean(formik.errors.periodId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Metals.qry}
                name='metalId'
                label={labels.metal}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                required
                onChange={(_, newValue) => formik.setFieldValue('metalId', newValue?.recordId || null) }
                error={formik.touched.metalId && Boolean(formik.errors.metalId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Group.qry}
                parameters='_startAt=0&_pageSize=1000'
                values={formik.values}
                name='itemGroupId'
                label={labels.itemGroup}
                valueField='recordId'
                displayField={['reference', 'name']}
                displayFieldWidth={1}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('itemGroupId', newValue?.recordId || null)}
                error={formik.touched.itemGroupId && formik.errors.itemGroupId}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Collections.qry}
                name='collectionId'
                label={labels.collection}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                values={formik.values}
                required
                onChange={(_, newValue) => formik.setFieldValue('collectionId', newValue?.recordId || null) }
                error={formik.touched.collectionId && Boolean(formik.errors.collectionId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='qtyPct'
                label={labels.qtyPct}
                value={formik.values.qtyPct}
                maxAccess={maxAccess}
                allowNegative={false}
                required
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('qtyPct', 0)}
                error={formik.touched.qtyPct && Boolean(formik.errors.qtyPct)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}