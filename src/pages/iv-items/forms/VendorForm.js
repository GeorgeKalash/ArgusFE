import { useState, useContext } from 'react'
import { Form, useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useEffect } from 'react'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'

const VendorForm = ({ labels, editMode, maxAccess, recordId, store, record }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.StrategyPrereq.qry
  })

  const { recordId: stgId } = store
  console.log(stgId, 'stg')

  const validationSchema = yup.object({})

  const { formik } = useForm({
    maxAccess,
    initialValues: { vendorId: '', currencyId: '', ...record },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema,
    onSubmit: values => {
      postPreReq(values)
    }
  })

  const postPreReq = async obj => {
    const isNewRecord = !obj?.recordId

    try {
      const res = await postRequest({
        extension: PurchaseRepository.PriceList.set,
        record: JSON.stringify(obj)
      })

      if (isNewRecord) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }
      invalidate()
    } catch (error) {}
  }

  //   console.log(stgId, 'ali')
  //   console.log(record, 'record')
  //   console.log(record.currencyId, 'currency')

  useEffect(() => {
    const fetchData = async () => {
      if (record && record.currencyId && record.vendorId) {
        try {
          console.log('Fetching data with record.currencyId:', record.currencyId)

          const res = await getRequest({
            extension: PurchaseRepository.PriceList.get,
            parameters: `_itemId=${stgId}&_vendorId=${formik.values.vendorId}&_currencyId=${formik.values.currencyId}`
          })
          console.log('Response from getRequest:', res)

          if (res.record) {
            formik.setValues(res.record)
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
    }

    fetchData()
  }, [record])

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      resourceId={ResourceIds.PriceList}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={PurchaseRepository.Vendor.snapshot}
                parameters={{
                  _type: 0
                }}
                name='vendorId'
                label={labels.account}
                valueField='vendorRef'
                displayField='vendorName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vendorId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('vendorRef', newValue ? newValue.reference : '')
                  formik.setFieldValue('vendorName', newValue ? newValue.name : '')
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={labels.currency}
                readOnly={formik.values.status == '3'}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default VendorForm
