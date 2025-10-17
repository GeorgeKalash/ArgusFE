import { useFormik } from 'formik'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import Tree from 'src/components/Shared/Tree'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'

const TreeForm = ({ maxAccess, treeDataWithNodes, fetchData }) => {
  const formik = useFormik({
    initialValues: {
      languageId: 1
    },
    validationSchema: yup.object({
      languageId: yup.number().required()
    })
  })

  return (
    <VertLayout>
      <Grow>
        <Grid item margin={3}>
          <ResourceComboBox
            datasetId={DataSets.LANGUAGE}
            name='languageId'
            valueField='key'
            displayField='value'
            defaultIndex={0}
            values={formik.values}
            required
            maxAccess={maxAccess}
            onChange={(_, newValue) => {
              formik.setFieldValue('languageId', newValue?.key || 1)
              fetchData(newValue?.key || 1)
            }}
            error={formik.touched.languageId && Boolean(formik.errors.languageId)}
          />
        </Grid>
        <Tree data={{ list: treeDataWithNodes }} printable={false} />
      </Grow>
    </VertLayout>
  )
}

export default TreeForm
