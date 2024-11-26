import { useEffect, useState, useContext } from 'react'
import { Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'

const IrDefaultForm = ({ _labels, access }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  useEffect(() => {
    getDataResult()
  }, [])

  const getDataResult = () => {
    const myObject = {}

    const filteredList = defaultsData?.list?.filter(obj => {
      return obj.key === 'ir_amcShortTerm' || obj.key === 'ir_amcLongTerm'
    })
    filteredList?.forEach(obj => (myObject[obj.key] = obj.value ? parseInt(obj.value) : null))
    formik.setValues(myObject)
    formik.setFieldValue('recordId', 'N/A')
  }

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: { ir_amcShortTerm: null, ir_amcLongTerm: null, recordId: 'N/A' },
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
    <FormShell resourceId={ResourceIds.IrDefault} form={formik} maxAccess={access} editMode={true} isSavedClear={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
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
            <Grid item xs={12} sx={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
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
    </FormShell>
  )
}

export default IrDefaultForm
