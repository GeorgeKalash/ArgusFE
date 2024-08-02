import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

export default function SaleZoneForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesZone.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      szRef: '',
      countryId: '',
      productionOrderLevel: '',
      parentId: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const response = await postRequest({
          extension: SaleRepository.SalesZone.set,
          record: JSON.stringify(obj)
        })

        if (!obj.recordId) {
          toast.success(platformLabels.Added)
          formik.setFieldValue('recordId', response.recordId)
        } else toast.success(platformLabels.Edited)

        invalidate()
      } catch (error) {}
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: SaleRepository.SalesZone.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.SalesZone} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='szRef'
                label={labels.reference}
                value={formik.values.szRef}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('szRef', '')}
                error={formik.touched.szRef && Boolean(formik.errors.szRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                required
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue?.recordId || '')
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.PRODUCTION_ORDER_LEVEL}
                name='productionOrderLevel'
                label={labels.pol}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('productionOrderLevel', newValue?.key)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.SalesZone.qry}
                parameters={{
                  _startAt: 0,
                  _pageSize: 100,
                  _sortField: 'recordId',
                  _filter: ''
                }}
                name='parentId'
                label={labels.parent}
                valueField='parentRef'
                displayField='name'
                valueShow='parentRef'
                secondValueShow='parentName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('parentId', newValue?.recordId || '')
                  formik.setFieldValue('parentName', newValue?.parentName || '')
                  formik.setFieldValue('parentRef', newValue?.parentRef || '')
                }}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
