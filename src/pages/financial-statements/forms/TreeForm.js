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

const TreeForm = ({ store, maxAccess, active }) => {
  const { recordId: fsId } = store
  const { getRequest } = useContext(RequestsContext)
  const [dataTree, setDataTree] = useState([])
  const [labelsTree, setLabelsTree] = useState([])

  const formik = useFormik({
    initialValues: {
      language: '1'
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      language: yup.number().required()
    })
  })

  useEffect(() => {
    active && fsId && getTreeNodes(fsId)
  }, [active])

  const getTreeNodes = async fsId => {
    const response = await getRequest({
      extension: FinancialStatementRepository.Node.qry,
      parameters: `_fsId=${fsId}`
    })
    console.log('res', response)
    setDataTree(response)

    const labelsResponse = await getRequest({
      extension: FinancialStatementRepository.Title.qry,
      parameters: `_fsNodeId=0`
    })

    console.log('labelsResponse', labelsResponse)

    const filteredLabelResp = labelsResponse?.list?.filter(
      lable => lable.languageId?.toString() === formik?.values?.language
    )

    console.log('FFlabelsResponse', filteredLabelResp, formik?.values?.language)
    setLabelsTree(filteredLabelResp)
  }

  return (
    <>
      {active && (
        <VertLayout>
          <Grow>
            <Grid item margin={3}>
              <ResourceComboBox
                datasetId={DataSets.LANGUAGE}
                name='language'
                valueField='key'
                displayField='value'
                defaultIndex={0}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('language', newValue?.key)
                }}
                error={formik.touched.language && Boolean(formik.errors.language)}
              />
            </Grid>
            <Tree data={dataTree} labels={labelsTree} printable={false} />
          </Grow>
        </VertLayout>
      )}
    </>
  )
}

export default TreeForm
