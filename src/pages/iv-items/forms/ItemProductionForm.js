import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { SCRepository } from 'src/repositories/SCRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'

export default function ItemProductionForm({ labels, editMode, maxAccess, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      itemId: recordId,
      lineId: '',
      spfId: '',
      ltId: '',
      classId: '',
      designId: '',
      standardCost: '',
      standardId: '',
      cgId: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: InventoryRepository.ItemProduction.set,
        record: JSON.stringify(obj)
      })

      formik.setValues({
        ...obj,
        recordId: response.recordId
      })
      toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.ItemProduction.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.IdCategories} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionLine.qry}
                name='lineId'
                label={labels.productionLine}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('lineId', newValue?.recordId || '')
                    formik.setFieldValue('ltId', '')
                  }
                }}
                error={formik.touched.lineId && Boolean(formik.errors.lineId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionClass.qry}
                values={formik.values}
                name='classId'
                label={labels.productionClass}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('classId', newValue?.recordId || '')
                }}
                error={formik.touched.classId && Boolean(formik.errors.classId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.ProductionStandard.qry}
                values={formik.values}
                name='standardId'
                label={labels.productionStandard}
                valueField='recordId'
                displayField='reference'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('standardId', newValue?.recordId || '')
                }}
                error={formik.touched.standardId && Boolean(formik.errors.standardId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.SerialProfile.qry}
                values={formik.values}
                name='spfId'
                label={labels.sprofile}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spfId', newValue?.recordId || '')
                }}
                error={formik.touched.spfId && Boolean(formik.errors.spfId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={ManufacturingRepository.ProductionClass.snapshot}
                valueField='reference'
                displayField='name'
                name='designId'
                label={labels.design}
                form={formik}
                secondDisplayField={true}
                firstValue={formik.values.designRef}
                secondValue={formik.values.designName}
                errorCheck={'designId'}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('designId', newValue?.recordId || '')
                  formik.setFieldValue('designRef', newValue?.reference || '')
                  formik.setFieldValue('designName', newValue?.name || '')
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='standardCost'
                label={labels.standardCost}
                value={formik.values.standardCost}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('standardCost', '')}
                required
                error={formik.touched.grossWgt && Boolean(formik.errors.grossWgt)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={ManufacturingRepository.CostGroup.qry}
                name='cgId'
                label={labels.cg}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cgId', newValue?.recordId)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SCRepository.LabelTemplate.qry}
                values={formik.values}
                name='ltId'
                label={labels.template}
                valueField='recordId'
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('ltId ', newValue?.recordId || '')
                }}
                error={formik.touched.ltId && Boolean(formik.errors.ltId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
