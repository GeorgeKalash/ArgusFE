// ** MUI Imports
import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared//ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function ProductionClassForm({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    reference: '',
    name: '',
    standardId: '',
    sfItemId: null,
    itemRef: '',
    itemName: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.ProductionClass.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: async obj => {
      console.log(obj)
      const recordId = obj.recordId

      const response = await postRequest({
        extension: ManufacturingRepository.ProductionClass.set,
        record: JSON.stringify(obj)
      })

      /*if (obj.sfItemId) {
        const itemObj = { classId: obj.recordId, sfItemId: obj.sfItemId }
        await postRequest({
          extension: ManufacturingRepository.ProductionClassSemiFinished.set,
          record: JSON.stringify(itemObj)
        })
      }*/ //FIX, ERROR MSG GEORGE, GET, 2 TAB, TEST

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          setIsLoading(true)

          const res = await getRequest({
            extension: ManufacturingRepository.ProductionClass.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)

          const itemRes = await getRequest({
            extension: ManufacturingRepository.ProductionClassSemiFinished.get,
            parameters: `_classId=${recordId}`
          })
          if (itemRes) {
            const itemDetRes = await getRequest({
              extension: InventoryRepository.Item.get,
              parameters: `_classId=${itemRes.record.sfItemId}`
            })
            formik.setFieldValue('sfItemId', itemRes.record.sfItemId)
            formik.setFieldValue('itemName', itemDetRes.record.name)
            formik.setFieldValue('itemRef', itemDetRes.record.sku)
          }
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.ProductionClass}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            rows={2}
            maxLength='4'
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
            helperText={formik.touched.reference && formik.errors.reference}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={ManufacturingRepository.ProductionStandard.qry}
            name='standardId'
            label={labels.prodStandard}
            valueField='recordId'
            displayField={'reference'}
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('standardId', newValue?.recordId)
            }}
            error={formik.touched.standardId && Boolean(formik.errors.standardId)}
            helperText={formik.touched.standardId && formik.errors.standardId}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceLookup
            endpointId={InventoryRepository.Item.snapshot}
            parameters={{
              _msId: 0,
              _categoryId: 0,
              _startAt: 0,
              _size: 1000
            }}
            form={formik}
            valueField='sku'
            displayField='name'
            name='itemRef'
            label={labels.semiFinishedItem}
            secondDisplayField={true}
            secondValue={formik.values.itemName}
            onChange={(event, newValue) => {
              if (newValue) {
                formik.setFieldValue('sfItemId', newValue?.recordId)
                formik.setFieldValue('itemRef', newValue?.sku)
                formik.setFieldValue('itemName', newValue?.name)
              } else {
                formik.setFieldValue('sfItemId', null)
                formik.setFieldValue('itemRef', '')
                formik.setFieldValue('itemName', '')
              }
            }}
            error={formik.touched.sfItemId && Boolean(formik.errors.sfItemId)}
            helperText={formik.touched.sfItemId && formik.errors.sfItemId}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
