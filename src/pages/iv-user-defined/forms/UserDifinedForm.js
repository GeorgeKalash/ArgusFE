import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'
import { useForm } from 'src/hooks/form'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const UserDifinedForm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const [stagingDimCount, setStagingDimCount] = useState(null)

  const { formik } = useForm({
    initialValues: {
      ivtDimCount: '',
      ivtDimension1: '',
      ivtDimension2: '',
      ivtDimension3: '',
      ivtDimension4: '',
      ivtDimension5: '',
      ivtDimension6: '',
      ivtDimension7: '',
      ivtDimension8: '',
      ivtDimension9: '',
      ivtDimension10: '',
      ivtDimension11: '',
      ivtDimension12: '',
      ivtDimension13: '',
      ivtDimension14: '',
      ivtDimension15: '',
      ivtDimension16: '',
      ivtDimension17: '',
      ivtDimension18: '',
      ivtDimension19: '',
      ivtDimension20: ''
    },
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      ivtDimCount: yup.number().nullable().required().min(1).max(20),
      ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => i + 1).map(num => [
          `ivtDimension${num}`,
          yup
            .string()
            .nullable()
            .test(function (value) {
              const { ivtDimCount } = this.parent

              return ivtDimCount >= num ? !!value : true
            })
        ])
      )
    }),

    onSubmit: async values => {
      await postDimensionSettings(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const fetchedValues = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
          return Object.keys(formik.values).includes(obj.key)
        })

        filteredList.forEach(obj => {
          if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
            fetchedValues[obj.key] = parseInt(obj.value)
          } else {
            fetchedValues[obj.key] = obj.value
          }
        })
        formik.setValues(fetchedValues)
      })
      .catch(error => {})
  }

  const postDimensionSettings = async obj => {
    var dataToPost = [{ key: 'ivtDimCount', value: obj.ivtDimCount }]
    for (let i = 1; i <= 20; i++) {
      const dimKey = `ivtDimension${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    })
      .then(res => {
        toast.success('Record Successfully Updated')
      })
      .catch(error => {})
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const handleDimCountChange = event => {
    setStagingDimCount(event.target.value)
  }

  function clearExcessFields(currentCount) {
    const ivtDimCount = currentCount
    for (let i = 1; i <= 20; i++) {
      const dimKey = `ivtDimension${i}`
      if (i > ivtDimCount) {
        formik.setFieldValue(dimKey, '')
      }
    }
  }

  const handleDimCountBlur = () => {
    if (stagingDimCount !== null) {
      formik.setFieldValue('ivtDimCount', stagingDimCount)
      process.nextTick(() => {
        clearExcessFields(stagingDimCount)
      })
    }
  }

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.UserDefined
  })

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} width={'50%'} sx={{ marginLeft: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginTop: '0.5rem' }}>
            <CustomNumberField
              name='ivtDimCount'
              label={_labels.propertiesCount}
              value={stagingDimCount === null ? formik.values.ivtDimCount : stagingDimCount}
              onChange={handleDimCountChange}
              onBlur={handleDimCountBlur}
              unClearable={true}
              arrow={true}
              min={1}
              max={20}
              error={formik.touched.ivtDimCount && Boolean(formik.errors.ivtDimCount)}
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ marginTop: '0.3rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <CustomTextField
                    key={index}
                    name={`ivtDimension${index + 1}`}
                    label={`${_labels.property} ${index + 1}`}
                    value={formik.values[`ivtDimension${index + 1}`]}
                    onClear={() => formik.setFieldValue(`ivtDimension${index + 1}`, '')}
                    onChange={formik.handleChange}
                    error={formik.values.ivtDimCount > index && Boolean(formik.errors[`ivtDimension${index + 1}`])}
                    inputProps={{
                      readOnly: formik.values.ivtDimCount <= index || formik.values.ivtDimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} sx={{ marginTop: '0.3rem' }}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index + 10}
                    name={`ivtDimension${index + 11}`}
                    label={`${_labels.property} ${index + 11}`}
                    value={formik.values[`ivtDimension${index + 11}`]}
                    onClear={() => formik.setFieldValue(`ivtDimension${index + 11}`, '')}
                    onChange={formik.handleChange}
                    error={formik.errors[`ivtDimension${index + 11}`]}
                    inputProps={{
                      readOnly: formik.values.ivtDimCount <= index + 10 || formik.values.ivtDimCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default UserDifinedForm
