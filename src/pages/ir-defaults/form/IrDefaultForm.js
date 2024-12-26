import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'

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

  const { formik, setFieldValidation } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: { ir_amcShortTerm: null, ir_amcLongTerm: null, ir_tfr_DocTypeId: null, recordId: 'N/A' },
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
    <FormShell
      resourceId={ResourceIds.SystemDefaults}
      form={formik}
      maxAccess={access}
      editMode={true}
      isSavedClear={false}
      isCleared={false}
      infoVisible={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
                setFieldValidation={setFieldValidation}
                maxValue={formik.values.ir_amcLongTerm}
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
                setFieldValidation={setFieldValidation}
                minValue={formik.values.ir_amcShortTerm}
                value={formik.values.ir_amcLongTerm}
                error={formik.touched.ir_amcLongTerm && Boolean(formik.errors.ir_amcLongTerm)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IrDefaultForm
