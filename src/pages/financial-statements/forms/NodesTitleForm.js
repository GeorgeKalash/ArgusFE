import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { AuthContext } from 'src/providers/AuthContext'
import { useForm } from 'src/hooks/form'

const NodesTitleForm = ({ labels, maxAccess, nodeId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      titles: []
    },
    onSubmit: async values => {
      const obj = values.titles.filter(line => line.title)
      await postRequest({
        extension: FinancialStatementRepository.Title.set2,
        record: JSON.stringify({
          fsNodeId: nodeId,
          titles: obj
        })
      })

      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.language,
      name: 'languageName',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.title,
      name: 'title',
      props: { maxLength: 50 }
    }
  ]

  async function getTitles() {
    if (!nodeId) return

    const [res, titlesXMLList] = await Promise.all([
      getRequest({
        extension: FinancialStatementRepository.Title.qry,
        parameters: `_fsNodeId=${nodeId}`
      }),
      getRequest({
        extension: SystemRepository.KeyValueStore,
        parameters: `_dataset=${DataSets.LANGUAGE}&_language=${user.languageId}`
      })
    ])

    const listView =
      titlesXMLList?.list?.map((node, index) => ({
        id: index + 1,
        languageId: parseInt(node.key, 10),
        title: res?.list?.find(item => item.languageId.toString() === node.key)?.title,
        fsNodeId: parseInt(nodeId, 10),
        languageName: node.value
      })) ?? []

    formik.setFieldValue('titles', listView)
  }

  useEffect(() => {
    getTitles()
  }, [nodeId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FinancialStatements}
      maxAccess={maxAccess}
      infoVisible={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            name='nodeTitleTable'
            onChange={value => formik.setFieldValue('titles', value)}
            value={formik?.values?.titles}
            error={formik?.errors?.titles}
            maxAccess={maxAccess}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default NodesTitleForm
