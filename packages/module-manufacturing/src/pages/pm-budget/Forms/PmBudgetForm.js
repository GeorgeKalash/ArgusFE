import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'

export default function PmBudgetForm ({ labels, recordId, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  
  const invalidate = useInvalidate({
    endpointId: ProductModelingRepository.Budget.page
  }) 

  const { formik } = useForm({
    initialValues: {
      recordId,
      header: {
        recordId,
        fiscalYear: null,
        periodId: null,
        developerId : null,
        designCount: 0
      },
      items: [{
        id: 1,
        budgetId: null,
        seqNo: 1,
        metalId: null,
        collectionId: null,
        itemGroupId: null,
        designCount: 0
      }]
    },
    maxAccess,
    validationSchema: yup.object({
      header: yup.object({
        fiscalYear: yup.number().required(),
        periodId: yup.number().required(),
        developerId: yup.number().required()
      }),
      items: yup.array().of(
        yup.object().shape({
          metalRef: yup.string().required(),
          collectionRef: yup.string().required(),
          itemGroupRef: yup.string().required(),
          designCount: yup.number().max(32767).required().notOneOf([0])
        })
      )
    }),
    onSubmit: async obj => {
      const items = formik.values.items.map((item, index) => ({
        ...item,
        budgetId: recordId || 0,
        seqNo: index + 1
      }))

      const res = await postRequest({
        extension: ProductModelingRepository.Budget.set2,
        record: JSON.stringify({ 
          header: {...obj.header, designCount: totalDesignCount},
          items
        })
      })
      toast.success(!recordId ? platformLabels.Added : platformLabels.Edited)
      await refetchForm(res?.recordId)
      invalidate()
    }
  })

  async function refetchForm(recordId) {
    if (!recordId) return
    
    const res = await getRequest({
      extension: ProductModelingRepository.Budget.get2,
      parameters: `_recordId=${recordId}`
    })

    const record = res?.record || {}
    formik.setValues({
      ...record,
      recordId: record.header?.recordId || null,
      header: record.header || {},
      items: (record.items || []).map((item, index) => ({ ...item, id: index + 1 }))
    })
  }

  useEffect(() => { if (recordId) refetchForm(recordId) }, [])

  const editMode = !!formik.values.recordId
  const totalDesignCount = formik.values?.items?.reduce((designCount, row) => designCount + (row?.designCount || 0), 0) ?? 0
  
  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.metal,
      name: 'metalRef',
      props: {
        endpointId: InventoryRepository.Metals.qry,
        valueField: 'recordId',
        displayField: 'reference',
        mapping: [
          { from: 'reference', to: 'metalRef' },
          { from: 'recordId', to: 'metalId' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.collection,
      name: 'collectionRef',
      props: {
        endpointId: InventoryRepository.Collections.qry,
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'reference', to: 'collectionRef' },
          { from: 'recordId', to: 'collectionId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.itemGroup,
      name: 'itemGroupRef',
      props: {
        endpointId: InventoryRepository.Group.qry,
        parameters: '_startAt=0&_pageSize=1000',     
        valueField: 'recordId',
        displayField: 'reference',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'reference', to: 'itemGroupRef' },
          { from: 'recordId', to: 'itemGroupId' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'numberfield',
      name: 'designCount',
      label: labels.designCount,
      flex: 1,
      props: { decimalScale: 0}
    }
  ]
  
  return (
    <FormShell
      resourceId={ResourceIds.PM_Budget}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='header.fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values.header}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('header.fiscalYear', newValue?.fiscalYear)}
                error={formik.touched.header?.fiscalYear && Boolean(formik.errors.header?.fiscalYear)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
               endpointId={ProductModelingRepository.Developer.qry}
               values={formik.values.header}
               name='header.developerId'
               label={labels.developer}
               valueField='recordId'
               displayField={['reference', 'name']}
               columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
               readOnly={editMode}
               required
               maxAccess={maxAccess}
               onChange={(_, newValue) => formik.setFieldValue('header.developerId', newValue?.recordId || null)}
               error={formik.touched.header?.developerId && formik.errors.header?.developerId}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalPeriod.qry}
                name='header.periodId'
                label={labels.period}
                valueField='periodId'
                displayField='name'
                values={formik.values.header}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('header.periodId', newValue?.periodId || null)}
                error={formik.touched.header?.periodId && Boolean(formik.errors.header?.periodId)}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='header.designCount'
                label={labels.designCount}
                value={totalDesignCount}
                maxAccess={maxAccess}
                readOnly
                error={formik.touched.header?.designCount && Boolean(formik.errors.header?.designCount)}
              />
            </Grid>
          </Grid>
        </Fixed>
         <Grow>
          <DataGrid
            name='items'
            columns={columns}
            value={formik.values.items}
            error={formik.errors.items}
            onChange={value => formik.setFieldValue('items', value)}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}