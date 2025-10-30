import { useEffect, useContext } from 'react'
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
import Form from 'src/components/Shared/Form'

const PosDefaultForm = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const formik = useFormik({
    validateOnChange: true,
    initialValues: {
      posItemPK: null
    },
    onSubmit: values => {
      postPosDefault(values)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'posItemPK'
    })
    filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    formik.setValues(myObject)
  }

  const postPosDefault = obj => {
    const data = []

    if (!Object.hasOwn(obj, 'posItemPK') || obj.posItemPK === null) {
      data.push({ key: 'posItemPK' })
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        data.push({ key: key, value: value })
      })
    }

    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateDefaults(data)
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.POS_ITEM_PRIMARY}
                name='posItemPK'
                label={_labels.posItem}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('posItemPK', newValue?.key)
                }}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PosDefaultForm
