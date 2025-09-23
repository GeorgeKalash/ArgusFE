import { useFormik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import Tree from 'src/components/Shared/Tree'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const TreeForm = ({ store, maxAccess }) => {
  const { recordId: fsId } = store
  const { getRequest } = useContext(RequestsContext)
  const [treeLabels, setTreeLabels] = useState([])

  const formik = useFormik({
    initialValues: {
      languageId: 1
    },
    validationSchema: yup.object({
      languageId: yup.number().required()
    })
  })

  async function getTreeNodes() {
    return await getRequest({
      extension: FinancialStatementRepository.Node.qry,
      parameters: `_fsId=${fsId}`
    })
  }

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: getTreeNodes,
    enabled: Boolean(fsId),
    endpointId: FinancialStatementRepository.Node.qry,
    datasetId: ResourceIds.FinancialStatements
  })

  const getTreelabels = async (languageId = formik?.values?.languageId || null) => {
    const labelsResponse = await getRequest({
      extension: FinancialStatementRepository.Title.qry,
      parameters: `_fsNodeId=0`
    })

    const filteredLabelResp = labelsResponse?.list?.filter(
      lable => lable.languageId?.toString() === languageId?.toString()
    )

    setTreeLabels(filteredLabelResp)
  }

  useEffect(() => {
    if (fsId) getTreelabels()
  }, [fsId])

  return (
    <>
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
                formik.setFieldValue('languageId', newValue ? newValue.key : 1)
                getTreelabels(newValue ? newValue.key : 1)
              }}
              error={formik.touched.languageId && Boolean(formik.errors.languageId)}
            />
          </Grid>
          <Tree data={data} labels={treeLabels} printable={false} />
        </Grow>
      </VertLayout>
    </>
  )
}

export default TreeForm
