import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'

const GLSettings = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  useEffect(() => {
    getDataResult()
  }, [defaultsData])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return (
        obj.key === 'GLACSegments' ||
        obj.key === 'GLACSeg0' ||
        obj.key === 'GLACSeg1' ||
        obj.key === 'GLACSeg2' ||
        obj.key === 'GLACSeg3' ||
        obj.key === 'GLACSeg4' ||
        obj.key === 'GLACSegName0' ||
        obj.key === 'GLACSegName1' ||
        obj.key === 'GLACSegName2' ||
        obj.key === 'GLACSegName3' ||
        obj.key === 'GLACSegName4'
      )
    })
    const numericKeys = ['GLACSegments', 'GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4']

    filteredList?.forEach(obj => {
      if (numericKeys.includes(obj.key)) {
        myObject[obj.key] = obj.value !== null ? Number(obj.value) : null
      } else {
        myObject[obj.key] = obj.value
      }
    })

    formik.setValues(myObject)
  }

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.GLSettings
  })

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      GLACSegments: null,
      GLACSeg0: null,
      GLACSeg1: null,
      GLACSeg2: null,
      GLACSeg3: null,
      GLACSeg4: null,
      GLACSegName0: '',
      GLACSegName1: '',
      GLACSegName2: '',
      GLACSegName3: '',
      GLACSegName4: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      GLACSegments: yup.number().nullable().required().min(2).max(5),
      GLACSeg0: yup.number().nullable().required().min(1).max(8),
      GLACSegName0: yup.string().nullable().required(),
      GLACSeg1: yup.number().nullable().required().min(1).max(8),
      GLACSegName1: yup.string().nullable().required(),
      GLACSeg2: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName2: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg3: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName3: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg4: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName4: yup
        .string()
        .nullable()
        .test(function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value.trim() !== '' : true
        })
    }),

    onSubmit: async values => {
      await postGLSettings(values)
    }
  })

  const postGLSettings = async obj => {
    var dataToPost = []

    dataToPost.push({ key: 'GLACSegments', value: obj.GLACSegments })
    for (let i = 0; i < 5; i++) {
      const segKey = `GLACSeg${i}`
      const nameKey = `GLACSegName${i}`

      if (obj[segKey] !== undefined) {
        dataToPost.push({ key: segKey, value: obj[segKey] })
      }
      if (obj[nameKey] !== undefined) {
        dataToPost.push({ key: nameKey, value: obj[nameKey] })
      }
    }
    await postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    }).then(res => {
      toast.success(platformLabels.Edited)
      updateDefaults(dataToPost)
    })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const segNumb = ['GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4']

  const segName = ['GLACSegName0', 'GLACSegName1', 'GLACSegName2', 'GLACSegName3', 'GLACSegName4']

  const onChangeGLACSegments = value => {
    if (value >= 2) {
      formik.setValues(prev => {
        const next = { ...prev, GLACSegments: value }

        segNumb.forEach((key, idx) => {
          next[key] = idx < value ? (prev[key] === '' || prev[key] == null ? null : Number(prev[key])) : null
        })

        segName.forEach((key, idx) => {
          next[key] = idx < value ? prev[key] ?? '' : ''
        })

        return next
      })
    } else {
      formik.setFieldValue('GLACSegments', value)
    }
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container sx={{ padding: 3 }} spacing={2}>
          <Grid item xs={12}>
            <CustomNumberField
              name='GLACSegments'
              label={labels.segments}
              value={formik.values.GLACSegments}
              onChange={(_, value) => onChangeGLACSegments(value)}
              onClear={() => formik.setFieldValue('GLACSegments', null)}
              min={2}
              max={5}
              arrow={true}
              error={Boolean(formik.errors.GLACSegments)}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            {segNumb.map((name, idx) => (
              <Grid key={name} item xs={12} sx={{ marginTop: '7px' }}>
                <CustomNumberField
                  name={name}
                  label={labels['segment' + idx]}
                  value={formik.values[name]}
                  onClear={() => formik.setFieldValue(name, '')}
                  numberField={true}
                  onChange={(_, value) => formik.setFieldValue(name, value)}
                  error={formik.values.GLACSegments > idx && Boolean(formik.errors[name])}
                  readOnly={formik.values.GLACSegments <= idx || formik.values.GLACSegments == 'null'}
                  min={1}
                  max={5}
                  arrow={true}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} lg={6}>
            {segName.map((name, idx) => (
              <Grid key={name} item xs={12} sx={{ marginTop: '7px' }}>
                <CustomTextField
                  name={name}
                  label={labels['segName' + idx]}
                  value={formik.values?.[name] || ''}
                  onClear={() => formik.setFieldValue(name, '')}
                  onChange={formik.handleChange}
                  error={formik.values.GLACSegments > idx && Boolean(formik.errors[name])}
                  readOnly={formik.values.GLACSegments <= idx || formik.values.GLACSegments == 'null'}
                  maxLength={20}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default GLSettings
