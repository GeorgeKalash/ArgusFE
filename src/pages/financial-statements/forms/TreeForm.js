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

const TreeForm = ({ mainRecordId, maxAccess }) => {
  const { getRequest } = useContext(RequestsContext)
  const [treeLabels, setTreeLabels] = useState([])
  const [dataWithNodes, setData] = useState([])

  const formik = useFormik({
    initialValues: {
      languageId: 1
    },
    validationSchema: yup.object({
      languageId: yup.number().required()
    })
  })

  const fetchData = async (languageId = formik?.values?.languageId || null) => {
    const [dataRes, labelsRes] = await Promise.all([
      getRequest({
        extension: FinancialStatementRepository.Node.qry,
        parameters: `_fsId=${mainRecordId}`
      }),
      getRequest({
        extension: FinancialStatementRepository.Title.qry,
        parameters: `_fsNodeId=0`
      })
    ])

    const filteredLabels =
      labelsRes?.list?.filter(label => label.languageId?.toString() === languageId?.toString()) ?? []

    const enrichedData =
      dataRes?.list?.map(item => ({
        ...item,
        name: filteredLabels.find(f => f.fsNodeId === item.recordId)?.title || 'undefined'
      })) ?? []

    setTreeLabels(filteredLabels)
    setData(enrichedData)
  }

  useEffect(() => {
    if (mainRecordId) fetchData()
  }, [mainRecordId])

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
                fetchData(newValue ? newValue.key : 1)
              }}
              error={formik.touched.languageId && Boolean(formik.errors.languageId)}
            />
          </Grid>
          <Tree data={{ list: dataWithNodes }} labels={treeLabels} printable={false} />
        </Grow>
      </VertLayout>
    </>
  )
}

export default TreeForm
