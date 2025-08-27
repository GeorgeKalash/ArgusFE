import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'

const IvSettings = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const [initialValues, setInitialValues] = useState({
    itemSearchStyle: null,
    itemSearchFields: null,
    iv_minSerialSize: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}
    const parameters = `_filter=`

    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    }).then(res => {
      const filteredList = res.list.filter(obj => {
        const trimmedKey = obj.key.trim()

        return (
          trimmedKey === 'itemSearchStyle' || trimmedKey === 'itemSearchFields' || trimmedKey === 'iv_minSerialSize'
        )
      })
      filteredList.forEach(obj => {
        const trimmedKey = obj.key.trim()
        myObject[trimmedKey] = obj.value ? parseFloat(obj.value) : null
      })
      setInitialValues(myObject)
    })
  }

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      iv_minSerialSize: yup.number().min(1).max(20)
    }),
    onSubmit: values => {
      postIvSettings(values)
    }
  })

  const postIvSettings = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ sysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
    })
  }

  return (
    <FormShell form={formik} maxAccess={access} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_STYLE}
                name='itemSearchStyle'
                label={_labels.itemSearchStyle}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchStyle', newValue?.key || '')
                }}
                error={formik.touched.itemSearchStyle && Boolean(formik.errors.itemSearchStyle)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_FIELDS}
                name='itemSearchFields'
                label={_labels.itemSearchFields}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchFields', newValue?.key || '')
                }}
                error={formik.touched.itemSearchFields && Boolean(formik.errors.itemSearchFields)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='iv_minSerialSize'
                label={_labels.serial}
                value={formik.values.iv_minSerialSize}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('iv_minSerialSize', '')}
                error={formik.touched.iv_minSerialSize && Boolean(formik.errors.iv_minSerialSize)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IvSettings
