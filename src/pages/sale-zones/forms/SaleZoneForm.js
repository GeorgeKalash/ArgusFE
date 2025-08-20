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
    maxAccess,
    initialValues: {
      recordId: null,
      name: null,
      szRef: null,
      countryId: null,
      productionOrderLevel: null,
      parentId: null,
      parentRef: '',
      parentName: null
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      szRef: yup.string().required(),
      countryId: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.SalesZone.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.SalesZone.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
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
                required
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
                  _pageSize: 3000,
                  _sortField: 'recordId',
                  _filter: ''
                }}
                valueField='szRef'
                displayField='name'
                name='parentId'
                label={labels.parent}
                form={formik}
                valueShow='parentRef'
                secondValueShow='parentName'
                columnsInDropDown={[
                  { key: 'szRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                displayFieldWidth={2}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('parentId', newValue?.recordId)
                  formik.setFieldValue('parentName', newValue?.name)
                  formik.setFieldValue('parentRef', newValue?.szRef || '')
                }}
                errorCheck={'parentId'}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
