import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CharacteristicForm = ({ labels, maxAccess, getCharacteristicGridData, recordId, window }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    validateOnChange: true,
    initialValues: { chId: null, seqNo: null, oper: null },
    validationSchema: yup.object({
      chId: yup.string().required(),
      seqNo: yup.string().required(),
      oper: yup.string().required()
    }),
    onSubmit: async values => {
      await postCharacteristic(values)
    }
  })

  const postCharacteristic = async obj => {
    const classId = obj.classId ? obj.classId : recordId
    obj.classId = classId
    await postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.set,
      record: JSON.stringify(obj)
    }).then(res => {
      toast.success(platformLabels.Added)
      getCharacteristicGridData(classId)
      window.close()
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.CharacteristicsGeneral.qry}
                parameters={`_startAt=0&_pageSize=50`}
                name='chId'
                label={labels.characteristics}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('chId', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('chId', newValue?.recordId || '')
                }}
                error={formik.touched.chId && Boolean(formik.errors.chId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.DR_OPERATOR}
                name='oper'
                label={labels.operator}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('oper', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('oper', newValue?.key || '')
                }}
                error={formik.touched.oper && Boolean(formik.errors.oper)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik?.values?.chId && DocumentReleaseRepository.CharacteristicsValues.qry}
                parameters={formik?.values?.chId && `_chId=${formik.values.chId}`}
                name='seqNo'
                label={labels.value}
                valueField='seqNo'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('seqNo', '')}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('seqNo', newValue?.seqNo || '')
                }}
                error={formik.touched.seqNo && Boolean(formik.errors.seqNo)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CharacteristicForm
