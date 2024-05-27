import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
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

const GLSettings = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [focus, setFocus] = useState()
  const handleBlur = () => setFocus(undefined)

  const [initialValues, setInitialValues] = useState({
    GLACSegments: null,
    GLACSeg0: null,
    GLACSeg1: null,
    GLACSeg2: null,
    GLACSeg3: null,
    GLACSeg4: null,
    GLACSegName0: null,
    GLACSegName1: null,
    GLACSegName2: null,
    GLACSegName3: null,
    GLACSegName4: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const filteredList = res.list.filter(obj => {
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

        filteredList.forEach(obj => {
          myObject[obj.key] =
            obj.key === 'GLACSegments' ||
            obj.key === 'GLACSeg0' ||
            obj.key === 'GLACSeg1' ||
            obj.key === 'GLACSeg2' ||
            obj.key === 'GLACSeg3' ||
            obj.key === 'GLACSeg4'
              ? obj.value
                ? parseInt(obj.value)
                : null
              : obj.value
              ? obj.value
              : null
        })

        setInitialValues(myObject)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.GLSettings
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,

    validationSchema: yup.object({
      GLACSegments: yup.number().nullable().required('GLACSegments is required').min(2).max(5),
      GLACSeg0: yup.number().nullable().required('Segment 1 is required').min(1).max(8),
      GLACSegName0: yup.string().nullable().required('GLACSegName0 is required'),
      GLACSeg1: yup.number().nullable().required('Segment 2 is required').min(1).max(8),
      GLACSegName1: yup.string().nullable().required('GLACSegName1 is required'),
      GLACSeg2: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test('is-glacseg2-required', 'Segment 3 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName2: yup
        .string()
        .nullable()
        .test('is-glacsegname2-required', 'GLACSegName2 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 3 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg3: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test('is-glacseg3-required', 'Segment 4 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName3: yup
        .string()
        .nullable()
        .test('is-glacsegname3-required', 'GLACSegName3 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 4 ? value != null && value.trim() !== '' : true
        }),
      GLACSeg4: yup
        .number()
        .nullable()
        .min(1)
        .max(8)
        .test('is-glacseg4-required', 'Segment 5 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value >= 1 && value <= 8 : true
        }),
      GLACSegName4: yup
        .string()
        .nullable()
        .test('is-glacsegname4-required', 'GLACSegName4 is required', function (value) {
          const { GLACSegments } = this.parent

          return GLACSegments >= 5 ? value != null && value.trim() !== '' : true
        })
    }),

    onSubmit: values => {
      postGLSettings(values)
    }
  })

  const postGLSettings = obj => {
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
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: dataToPost })
    })
      .then(res => {
        toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const segNumb = ['GLACSeg0', 'GLACSeg1', 'GLACSeg2', 'GLACSeg3', 'GLACSeg4']

  const segName = ['GLACSegName0', 'GLACSegName1', 'GLACSegName2', 'GLACSegName3', 'GLACSegName4']

  useEffect(() => {
    const segmentsNum = formik.values.GLACSegments

    segNumb.forEach((seg, idx) => {
      if (idx >= segmentsNum) {
        formik.setFieldValue(seg, null)
      }
    })
    segName.forEach((seg, idx) => {
      if (idx >= segmentsNum) {
        formik.setFieldValue(seg, null)
      }
    })
  }, [formik.values.GLACSegments])

  return (
    <VertLayout>
      <Grow>
        <Grid container sx={{ padding: 3 }} spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              name='GLACSegments'
              label={_labels.segments}
              value={formik.values.GLACSegments}
              onChange={formik.handleChange}
              type='number'
              numberField={true}
              onBlur={formik.handleChange}
              onClear={() => formik.setFieldValue('GLACSegments', '')}
              error={formik.touched.GLACSegments && Boolean(formik.errors.GLACSegments)}
              inputProps={{
                min: 2,
                max: 5,
                maxLength: 1,
                inputMode: 'numeric',
                pattern: '[2-5]*'
              }}
              helperText={formik.touched.GLACSegments && formik.errors.GLACSegments}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            {segNumb.map((name, idx) => (
              <Grid key={name} item xs={12} sx={{ marginTop: '7px' }}>
                <CustomTextField
                  name={name}
                  label={_labels['segment' + idx]}
                  value={formik.values[name]}
                  onClear={() => formik.setFieldValue(name, '')}
                  type='number'
                  numberField={true}
                  onChange={formik.handleChange}
                  error={formik.values.GLACSegments > idx && Boolean(formik.errors[name])}
                  inputProps={{
                    min: 1,
                    max: 8,
                    readOnly: formik.values.GLACSegments <= idx || formik.values.GLACSegments == 'null',
                    maxLength: 1,
                    inputMode: 'numeric',
                    pattern: '[1-8]*'
                  }}
                  helperText={formik.touched[name] && formik.errors[name]}
                />
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} lg={6}>
            {segName.map((name, idx) => (
              <Grid key={name} item xs={12} sx={{ marginTop: '7px' }}>
                <CustomTextField
                  name={name}
                  label={_labels['segName' + idx]}
                  onBlur={handleBlur}
                  onFocus={e => setFocus(e.target.name)}
                  value={formik.values[name]}
                  onClear={() => formik.setFieldValue(name, '')}
                  numberField={true}
                  onChange={formik.handleChange}
                  error={formik.values.GLACSegments > idx && Boolean(formik.errors[name])}
                  inputProps={{
                    maxLength: '20',
                    style: { textAlign: 'left' },
                    readOnly: formik.values.GLACSegments <= idx || formik.values.GLACSegments == 'null'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default GLSettings
