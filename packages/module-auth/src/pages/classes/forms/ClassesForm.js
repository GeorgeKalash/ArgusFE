import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const ClassesForm = ({ labels, editMode, maxAccess, setEditMode, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.Class.qry
  })

  const [initialValues, setInitialData] = useState({
    recordId: null,
    name: null,
    characteristicOperator: null
  })

  const formik = useFormik({
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      characteristicOperator: yup.string().required(' ')
    }),
    onSubmit: async values => {
      await postClass(values)
    }
  })

  const postClass = async obj => {
    const recordId = obj.recordId
    await postRequest({
      extension: DocumentReleaseRepository.Class.set,
      record: JSON.stringify(obj)
    }).then(res => {
      if (!recordId) {
        setEditMode(true)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
        formik.setFieldValue('recordId', res.recordId)
        toast.success('Record Added Successfully')
      } else toast.success('Record Edited Successfully')
      invalidate()
    })
  }

  useEffect(() => {
    recordId && getClassesById(recordId)
  }, [recordId])

  const getClassesById = recordId => {
    const defaultParams = `_recordId=${recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Class.get,
      parameters: parameters
    }).then(res => {
      formik.setValues(res.record)
      setEditMode(true)
    })
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.Classes} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CHAR_OPERATOR}
                name='characteristicOperator'
                label={labels.characteristicOperator}
                required
                valueField='key'
                displayField='value'
                values={formik.values}
                onClear={() => formik.setFieldValue('name', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('characteristicOperator', newValue?.key || '')
                }}
                error={formik.touched.characteristicOperator && Boolean(formik.errors.characteristicOperator)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ClassesForm
