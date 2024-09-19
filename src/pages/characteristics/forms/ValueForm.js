import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const ValueForm = ({ labels, maxAccess, getValueGridData, recordId, seqNo, window, chId }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [initialValues, setInitialData] = useState({
    value: null
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
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
      if (recordId) {
        toast.success(platformLabels.Edited)
      } else toast.success(platformLabels.Added)
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
    <FormShell
      form={formik}
      resourceId={ResourceIds.Characteristics}
      maxAccess={maxAccess}
      isInfo={false}
      isSavedClear={false}
      isCleared={false}
    >
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
    </FormShell>
  )
}

export default ValueForm
