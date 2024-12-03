import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemFunction } from 'src/resources/SystemFunction'
import FormShell from 'src/components/Shared/FormShell'

const IRDefault = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const [initialValues, setInitialValues] = useState({
    ir_tfr_DocTypeId: null
  })

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => obj.key === 'ir_tfr_DocTypeId')
    filteredList.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    setInitialValues(myObject)
  }

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    validationSchema: yup.object({
      ir_tfr_DocTypeId: yup.string().required()
    }),
    onSubmit: values => {
      postIRDefault(values)
    }
  })

  const postIRDefault = obj => {
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
      updateDefaults(data)
    })
  }

  return (
    <FormShell form={formik} maxAccess={access} editMode={false} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container xs={12}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialTransfer}`}
                name='ir_tfr_DocTypeId'
                required
                label={_labels.docType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={'name'}
                values={formik.values}
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('ir_tfr_DocTypeId', newValue?.recordId || '')
                }}
                error={formik.touched.ir_tfr_DocTypeId && Boolean(formik.errors.ir_tfr_DocTypeId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IRDefault
