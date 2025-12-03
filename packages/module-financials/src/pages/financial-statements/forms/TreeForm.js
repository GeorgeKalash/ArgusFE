import { useFormik } from 'formik'
import * as yup from 'yup'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import Tree from '@argus/shared-ui/src/components/Shared/Tree'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import { useEffect, useMemo } from 'react'

const TreeForm = ({ maxAccess, initialData, fetchData }) => {
  const formik = useFormik({
    initialValues: { languageId: 1 },
    validationSchema: yup.object({
      languageId: yup.number().required()
    })
  })

  const treeDataWithParentId = useMemo(() => {
    if (!initialData?.nodes?.length) return []

    const { nodes, titles = [] } = initialData

    return nodes.map(node => {
      const title = titles.find(
        t => t.seqNo == node.seqNo && t.fsId == node.fsId && t.languageId == formik.values.languageId
      )

      return {
        ...node,
        name: title?.title || 'undefined',
        parentId: node.parentSeqNo ?? null,
        recordId: node.seqNo
      }
    })
  }, [initialData, formik.values.languageId])

  useEffect(() => {
    if (formik.values.languageId && fetchData) {
      fetchData(formik.values.languageId)
    }
  }, [formik.values.languageId])

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
            }}
            error={formik.touched.languageId && Boolean(formik.errors.languageId)}
          />
        </Grid>

        <Tree data={{ list: treeDataWithParentId }} printable={false} />
      </Grow>
    </VertLayout>
  )
}

export default TreeForm
