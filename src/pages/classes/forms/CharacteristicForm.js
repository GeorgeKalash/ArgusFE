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
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const CharacteristicForm = ({ labels, maxAccess, getCharacteristicGridData, recordId, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const [initialValues, setInitialData] = useState({
    chId: null,
    seqNo: null
  })

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      chId: yup.string().required(' '),
      seqNo: yup.string().required(' ')
    }),
    onSubmit: async values => {
      await postCharacteristic(values)
    }
  })

  const postCharacteristic = async obj => {
    const classId = obj.classId ? obj.classId : recordId
    obj.classId = classId
    await postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Added Successfully')
        getCharacteristicGridData(classId)
        window.close()
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <FormShell form={formik} resourceId={ResourceIds.Characteristics} maxAccess={maxAccess} isInfo={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.CharacteristicsGeneral.qry}
                parameters={`_startAt=0&_pageSize=50`}
                name='chId'
                label={labels.characteristics}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('chId', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('chId', newValue?.recordId || '')
                }}
                error={formik.touched.chId && Boolean(formik.errors.chId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik?.values?.chId && DocumentReleaseRepository.CharacteristicsValues.qry}
                parameters={formik?.values?.chId && `_chId=${formik.values.chId}`}
                name='seqNo'
                label={labels.value}
                valueField='seqNo'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('seqNo', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('seqNo', newValue?.seqNo || '')
                }}
                error={formik.touched.seqNo && Boolean(formik.errors.seqNo)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CharacteristicForm
