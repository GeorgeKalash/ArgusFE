import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'

import CustomTextField from 'src/components/Inputs/CustomTextField'

import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

export default function SitesForm({ labels, recordId, maxAccess }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Site.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      reference: '',
      plantId: '',
      plId: '',
      costCenterId: '',
      siteGroupId: '',
      isInactive: false,
      allowNegativeQty: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      plantId: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: InventoryRepository.Site.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: InventoryRepository.Site.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Sites} form={formik} height={400} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
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
        {/* <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Country.qry}
            name='countryId'
            label={labels.country}
            valueField='recordId'
            displayField='name'
            readOnly={editMode}
            displayFieldWidth={1}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('countryId', newValue?.recordId || '')
            }}
            error={formik.touched.countryId && formik.errors.countryId}
          />
        </Grid> */}
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Plant.qry}
            name='plantId'
            label={labels.plant}
            valueField='recordId'
            values={formik.values}
            required
            displayField='name'
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            onChange={(event, newValue) => {
              formik.setFieldValue('plantId', newValue?.recordId || '')
              console.log(plant)
            }}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={GeneralLedgerRepository.CostCenter.qry}
            parameters={`_params=&_startAt=0&_pageSize=200`}
            name='costCenterId'
            label={labels.costCenter}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik && formik.setFieldValue('costCenterId', newValue?.recordId)
            }}
            error={formik.touched.costCenterId && Boolean(formik.errors.costCenterId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
