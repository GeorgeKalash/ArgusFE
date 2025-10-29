import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import Form from 'src/components/Shared/Form'

const ValueForm = ({ labels, maxAccess, getValueGridData, recordId, seqNo, window, chId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    initialValues: {
      value: null
    },
    validateOnChange: true,
    validationSchema: yup.object({
      value: yup.string().required()
    }),
    onSubmit: async values => {
      await postValue(values)
    }
  })

  const postValue = async obj => {
    obj.chId = chId
    obj.seqNo = seqNo
    await postRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.set,
      record: JSON.stringify(obj)
    }).then(res => {
      getValueGridData(chId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      window.close()
    })
  }

  useEffect(() => {
    recordId && getCharacteristicsById(recordId)
  }, [recordId])

  const getCharacteristicsById = recordId => {
    console.log(recordId)
    const defaultParams = `_chId=${recordId}&_seqNo=${seqNo}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.get,
      parameters: parameters
    }).then(res => {
      res.record.validFrom = formatDateFromApi(res.record.validFrom)
      formik.setValues(res.record)
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTextField
                name='value'
                label={labels.values}
                value={formik.values.value}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('value', '')}
                error={formik.touched.value && Boolean(formik.errors.value)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default ValueForm
