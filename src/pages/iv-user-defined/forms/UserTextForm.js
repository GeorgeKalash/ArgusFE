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
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const UserTextForm = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const [stagingDimCount, setStagingDimCount] = useState(null)

  const { formik } = useForm({
    initialValues: {
      ivtUDTCount: '',
      ivtUDT1: '',
      ivtUDT2: '',
      ivtUDT3: '',
      ivtUDT4: '',
      ivtUDT5: '',
      ivtUDT6: '',
      ivtUDT7: '',
      ivtUDT8: '',
      ivtUDT9: '',
      ivtUDT10: '',
      ivtUDT11: '',
      ivtUDT12: '',
      ivtUDT13: '',
      ivtUDT14: '',
      ivtUDT15: '',
      ivtUDT16: '',
      ivtUDT17: '',
      ivtUDT18: '',
      ivtUDT19: '',
      ivtUDT20: ''
    },
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      ivtUDTCount: yup.number().nullable().required().min(1).max(20),
      ...Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => i + 1).map(num => [
          `ivtUDT${num}`,
          yup
            .string()
            .nullable()
            .test(function (value) {
              const { ivtUDTCount } = this.parent

              return ivtUDTCount >= num ? !!value : true
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

    const filteredList = defaultsData?.list?.filter(obj => {
      return Object.keys(formik.values).includes(obj.key)
    })

    filteredList?.forEach(obj => {
      if (obj.value && !isNaN(obj.value) && obj.value.trim() !== '') {
        fetchedValues[obj.key] = parseInt(obj.value)
      } else {
        fetchedValues[obj.key] = obj.value
      }
    })
    formik.setValues(fetchedValues)
  }

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.UserDefined
  })

  const postDimensionSettings = async obj => {
    var dataToPost = [{ key: 'ivtUDTCount', value: obj.ivtUDTCount }]
    for (let i = 1; i <= 20; i++) {
      const dimKey = `ivtUDT${i}`
      if (obj[dimKey] !== undefined) {
        dataToPost.push({ key: dimKey, value: obj[dimKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    }).then(res => {
      toast.success(platformLabels.Updated)
      updateDefaults(dataToPost)
    })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const handleDimCountChange = event => {
    setStagingDimCount(event.target.value)
  }

  function clearExcessFields(currentCount) {
    const ivtUDTCount = currentCount
    for (let i = 1; i <= 20; i++) {
      const dimKey = `ivtUDT${i}`
      if (i > ivtUDTCount) {
        formik.setFieldValue(dimKey, '')
      }
    }
  }

  const handleDimCountBlur = () => {
    if (stagingDimCount !== null) {
      formik.setFieldValue('ivtUDTCount', stagingDimCount)
      process.nextTick(() => {
        clearExcessFields(stagingDimCount)
      })
    }
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} width={'50%'} sx={{ marginLeft: '0.5rem' }}>
          <Grid item xs={12} sx={{ marginTop: '0.5rem' }}>
            <CustomNumberField
              name='ivtUDTCount'
              label={_labels.propertiesCount}
              value={stagingDimCount === null ? formik.values.ivtUDTCount : stagingDimCount}
              onChange={handleDimCountChange}
              onBlur={handleDimCountBlur}
              unClearable={true}
              min={1}
              max={20}
              arrow={true}
              error={formik.touched.ivtUDTCount && Boolean(formik.errors.ivtUDTCount)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={index}>
                  <CustomTextField
                    key={index}
                    name={`ivtUDT${index + 1}`}
                    label={`${_labels.property} ${index + 1}`}
                    value={formik.values[`ivtUDT${index + 1}`]}
                    onClear={() => formik.setFieldValue(`ivtUDT${index + 1}`, '')}
                    onChange={formik.handleChange}
                    error={formik.values.ivtUDTCount > index && Boolean(formik.errors[`ivtUDT${index + 1}`])}
                    inputProps={{
                      readOnly: formik.values.ivtUDTCount <= index || formik.values.ivtUDTCount === 'null'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {Array.from({ length: 10 }).map((_, index) => (
                <Grid item xs={12} key={1}>
                  <CustomTextField
                    key={index + 10}
                    name={`ivtUDT${index + 11}`}
                    label={`${_labels.property} ${index + 11}`}
                    value={formik.values[`ivtUDT${index + 11}`]}
                    onClear={() => formik.setFieldValue(`ivtUDT${index + 11}`, '')}
                    onChange={formik.handleChange}
                    error={formik.errors[`ivtUDT${index + 11}`]}
                    inputProps={{
                      readOnly: formik.values.ivtUDTCount <= index + 10 || formik.values.ivtUDTCount === 'null'
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

export default UserTextForm
