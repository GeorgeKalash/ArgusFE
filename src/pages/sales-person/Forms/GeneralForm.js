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
import { SaleRepository } from 'src/repositories/SaleRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

export default function ScheduleForm({ labels, maxAccess, recordId, editMode, setEditMode }) {
  const [isLoading, setIsLoading] = useState(false)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    spRef: '',
    name: '',
    cellPhone: '',
    commissionPct: '',
    segmentRef: '',
    plantId: '',
    sptId: ''
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.SalesPerson.qry
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: SaleRepository.SalesPerson.set,
        record: JSON.stringify(obj)
      })

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
            extension: SaleRepository.SalesPerson.get,
            parameters: `_recordId=${recordId}`
          })

          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.SalesPerson}
      form={formik}
      height={300}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='spRef'
            label={labels[1]}
            value={formik.values.spRef}
            required
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('spRef', '')}
            error={formik.touched.spRef && Boolean(formik.errors.spRef)}
            helperText={formik.touched.spRef && formik.errors.spRef}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels[2]}
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
          <CustomTextField
            name='cellPhone'
            label={labels[3]}
            value={formik.values.cellPhone}
            maxAccess={maxAccess}
            maxLength='15'
            onChange={e => {
              const inputValue = e.target.value
              if (/^[0-9]*$/.test(inputValue)) {
                formik.setFieldValue('cellPhone', inputValue)
              }
            }}
            onClear={() => formik.setFieldValue('cellPhone', '')}
            error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
            helperText={formik.touched.cellPhone && formik.errors.cellPhone}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='commissionPct'
            label={labels[4]}
            value={formik.values.commissionPct}
            maxAccess={maxAccess}
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('commissionPct', '')}
            error={formik.touched.commissionPct && Boolean(formik.errors.commissionPct)}
            helperText={formik.touched.commissionPct && formik.errors.commissionPct}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={FinancialRepository.Segment.qry}
            name='segmentRef'
            label={labels[5]}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            valueField='reference'
            displayField={['reference', 'name']}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('segmentRef', newValue?.reference)
            }}
            error={formik.touched.segmentRef && Boolean(formik.errors.segmentRef)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SystemRepository.Plant.qry}
            name='plantId'
            label={labels[6]}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            valueField='recordId'
            displayField={['reference', 'name']}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('plantId', newValue?.recordId)
            }}
            error={formik.touched.plantId && Boolean(formik.errors.plantId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SaleRepository.SalesTeam.qry}
            name='sptId'
            label={labels[7]}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={formik.values}
            valueField='recordId'
            displayField={['reference', 'name']}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('sptId', newValue?.recordId)
            }}
            error={formik.touched.sptId && Boolean(formik.errors.sptId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={SaleRepository.CommissionSchedule.qry}
            name='commissionScheduleId'
            label={labels[11]}
            columnsInDropDown={[{ key: 'name', value: 'Name' }]}
            values={formik.values}
            valueField='recordId'
            displayField='name'
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('commissionScheduleId', newValue?.recordId)
            }}
            error={formik.touched.commissionScheduleId && Boolean(formik.errors.commissionScheduleId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
