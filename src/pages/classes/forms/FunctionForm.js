import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const FunctionForm = ({
  labels,
  maxAccess,
  getFunctionGridData,
  recordId,
  functionId,
  window,
  editMode
}) => {

  const { postRequest, getRequest} = useContext(RequestsContext)

  const [initialValues , setInitialData] = useState({
    functionId: null,
    strategyId: null,
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      functionId: yup.string().required(' '),
      strategyId: yup.string().required(' ')
    }),
    onSubmit: values => {
      postFunction(values)
    }
  })
  
  const postFunction = obj => {
    const classId = obj.classId ? obj.classId : recordId
    obj.classId = classId
    postRequest({
      extension: DocumentReleaseRepository.ClassFunction.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getFunctionGridData(classId)
        if (!editMode) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')
        window.close()
      })
      .catch(error => {
      })
  }

  useEffect(()=>{
    editMode  && getFunctionsById(recordId, functionId)
  },[recordId])

  const getFunctionsById =  (recordId, functionId) => {
     const defaultParams = `_classId=${recordId}&&_functionId=${functionId}`
    var parameters = defaultParams
     getRequest({
      extension: DocumentReleaseRepository.ClassFunction.get,
      parameters: parameters
    })
      .then(res => {
        console.log(res.record)
        formik.setValues(res.record)
      })
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Functions}
      maxAccess={maxAccess}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
              <Grid item xs={12}>
                <ResourceComboBox
                  datasetId={DataSets.SYSTEM_FUNCTION}
                  name='functionId'
                  label={labels.function}
                  required
                  valueField='key'
                  displayField='value'
                  readOnly={editMode}
                  values={formik.values}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('functionId', '')}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('functionId', newValue?.key || '')
                  }}
                  error={formik.touched.functionId && Boolean(formik.errors.functionId)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={DocumentReleaseRepository.Strategy.qry}
                  parameters={`_startAt=0&_pageSize=50`}
                  name='strategyId'
                  label={labels.strategy}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values}
                  required      
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('strategyId', '')}
                  onChange={(event, newValue) => {
                      formik && formik.setFieldValue('strategyId', newValue?.recordId || '')
                  }}
                  error={formik.touched.strategyId && Boolean(formik.errors.strategyId)}
                />
              </Grid>
            </Grid> 
          </Grow>
        </VertLayout>
    </FormShell>
  )
}

export default FunctionForm
