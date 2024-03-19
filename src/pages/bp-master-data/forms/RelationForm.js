// ** MUI Imports
import { Grid, Box} from '@mui/material'

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
import { formatDateToApi } from 'src/lib/date-helper'


const RelationForm = ({
  bpId,
  recordId,
  labels,
  maxAccess,
  getRelationGridData,
  editMode
}) => {

  const [businessPartnerStore, setBusinessPartnerStore] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)

const [initialValues , setvalues] = useState({
  recordId: null,
  toBPId: null ,
  relationId: null ,
  relationName: null  ,
  startDate: null ,
  endDate: null ,
  toBPName: null,
  toBPRef: null,
  fromBPId: bpId
})

  //Relation Tab
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      toBPId: yup.string().required('This field is required'),
      relationId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log('relation values ' + JSON.stringify(values))
      postRelation(values)
    }
  })

  const postRelation = obj => {

         obj.startDate = formatDateToApi(obj.startDate)
         obj.endDate = formatDateToApi(obj.endDate)

    postRequest({
      extension: BusinessPartnerRepository.Relation.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        getRelationGridData(bpId)
      })


      .catch(error => {
      })
  }

    useEffect(()=>{
      getRelationById(bpId)
    },[bpId])

    const getRelationById = recordId => {

      const defaultParams = `_recordId=${recordId}`
      var parameters = defaultParams
      getRequest({
        extension: BusinessPartnerRepository.Relation.get,
        parameters: parameters
      })
        .then(res => {
          console.log('get ' + JSON.stringify())
          formik.setValues(populateRelation(res.record))
        })
        .catch(error => {
        })
    }

  return (

      <FormShell
       resourceId={ResourceIds.BPMasterData}
       form={formik}
       maxAccess={maxAccess}
       editMode={editMode}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
            <Grid item xs={12}>
            <CustomLookup
              name='toBPId'
              label= {labels.businessPartner}
              value={formik.values.toBPId}
              required
              valueField='reference'
              displayField='name'
              store={businessPartnerStore}
              firstValue={formik.values.toBPRef}
              secondValue={formik.values.toBPName}
              setStore={setBusinessPartnerStore}
              onLookup={searchQry => {
    setBusinessPartnerStore([])
    if(searchQry){
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: BusinessPartnerRepository.MasterData.snapshot,
      parameters: parameters
    })
      .then(res => {
        setBusinessPartnerStore(res.list)
      })
      .catch(error => {
         setErrorMessage(error)
      })}
  }}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('toBPId', newValue?.recordId)
                  formik.setFieldValue('toBPRef', newValue?.reference)
                  formik.setFieldValue('toBPName', newValue?.name)
                } else {
                  formik.setFieldValue('toBPId', null)
                  formik.setFieldValue('toBPRef', null)
                  formik.setFieldValue('toBPName', null)
                }
              }}
              error={
                formik.touched.toBPId &&
                Boolean(formik.errors.toBPId)
              }
              helperText={
                formik.touched.toBPId && formik.errors.toBPId
              }
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={BusinessPartnerRepository.RelationTypes.qry}
              name='relationId'
              label={labels.relation}
              columnsInDropDown= {[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik && formik.setFieldValue('relationId', newValue?.recordId);
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
