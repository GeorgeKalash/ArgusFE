import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import * as yup from 'yup'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const IrDefaultForm = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'ir_amcShortTerm' || obj.key === 'ir_amcLongTerm' || obj.key === 'ir_tfr_DocTypeId'
    })
    filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    formik.setValues(myObject)
    formik.setFieldValue('recordId', 'N/A')
  }

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: { ir_amcShortTerm: null, ir_amcLongTerm: null, ir_tfr_DocTypeId: null, recordId: 'N/A' },
    validationSchema: yup.object().shape({
      ir_amcShortTerm: yup
        .number()
        .nullable()
        .test(function (value) {
          const { ir_amcLongTerm } = this.parent

          return value == null || ir_amcLongTerm == null || value <= ir_amcLongTerm
        }),
      ir_amcLongTerm: yup.number().nullable()
    }),
    onSubmit: values => {
      postDefault(values)
    }
  })

  const postDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value]) => {
      const newObj = { key: key, value: value }
      data.push(newObj)
    })
    postRequest({
      extension: SystemRepository.Defaults.set,
      record: JSON.stringify({ SysDefaults: data })
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      updateDefaults(data)
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} editMode={true}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.MaterialTransfer}`}
                name='ir_tfr_DocTypeId'
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
                  formik && formik.setFieldValue('ir_tfr_DocTypeId', newValue?.recordId || null)
                }}
                error={formik.touched.ir_tfr_DocTypeId && Boolean(formik.errors.ir_tfr_DocTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                onClear={() => formik.setFieldValue('ir_amcShortTerm', '')}
                name='ir_amcShortTerm'
                onChange={formik.handleChange}
                label={_labels.shortTerm}
                value={formik.values.ir_amcShortTerm}
                error={formik.touched.ir_amcShortTerm && Boolean(formik.errors.ir_amcShortTerm)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                onClear={() => formik.setFieldValue('ir_amcLongTerm', '')}
                name='ir_amcLongTerm'
                onChange={formik.handleChange}
                label={_labels.longTerm}
                value={formik.values.ir_amcLongTerm}
                error={formik.touched.ir_amcLongTerm && Boolean(formik.errors.ir_amcLongTerm)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default IrDefaultForm
