// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports

import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { formatDateFromApi, formatDateToApiFunction } from 'src/lib/date-helper'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

const RelationForm = ({ bpId, recordId, labels, maxAccess, getRelationGridData, window, editMode }) => {
  const [businessPartnerStore, setBusinessPartnerStore] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [initialValues, setValues] = useState({
    recordId: null,
    toBPId: null,
    relationId: null,
    relationName: null,
    startDate: null,
    endDate: null,
    toBPName: null,
    toBPRef: null,
    fromBPId: bpId
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required(' '),
      relationId: yup.string().required(' ')
    }),
    onSubmit: values => {
      postRelation(values)
    }
  })

  const postRelation = obj => {
    obj.startDate = obj.startDate ? formatDateToApiFunction(obj.startDate) : ''
    obj.endDate = obj.endDate ? formatDateToApiFunction(obj.endDate) : ''

    postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        getRelationGridData(bpId)
        window.close()
      })

      .catch(error => {})
  }

  useEffect(() => {
    recordId && getRelationById(recordId)
  }, [recordId])

  const getRelationById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: BusinessPartnerRepository.Relation.get,
      parameters: parameters
    })
      .then(res => {
        res.record.startDate = formatDateFromApi(res.record.startDate)
        res.record.endDate = formatDateFromApi(res.record.endDate)
        formik.setValues(res.record)
      })
      .catch(error => {})
  }

  return (
    <FormShell
      resourceId={ResourceIds.BPMasterData}
      form={formik}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={BusinessPartnerRepository.MasterData.snapshot}
                name='toBPId'
                label={labels.businessPartner}
                form={formik}
                required
                displayFieldWidth={2}
                valueField='reference'
                displayField='name'
                firstValue={formik.values.toBPRef}
                secondValue={formik.values.toBPName}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    toBPId: newValue?.recordId || '',
                    toBPRef: newValue?.reference || '',
                    toBPName: newValue?.name || ''
                  })
                }}
                error={formik.touched.toBPId && Boolean(formik.errors.toBPId)}
                helperText={formik.touched.toBPId && formik.errors.toBPId}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={BusinessPartnerRepository.RelationTypes.qry}
                name='relationId'
                label={labels.relation}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('relationId', newValue?.recordId)
                }}
                error={formik.touched.relationId && Boolean(formik.errors.relationId)}
                helperText={formik.touched.relationId && formik.errors.relationId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={labels.from}
                value={formik.values.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={labels.to}
                value={formik.values.endDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </FormShell>
  )
}

export default RelationForm
