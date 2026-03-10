import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const NodesTitleForm = ({ labels, maxAccess, node, mainRecordId, onOk, window, initialData = [] }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user } = useContext(AuthContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      titles: []
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
    if (!node?.current?.viewNodeId) return

    const titlesXMLList = await getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: `_dataset=${DataSets.LANGUAGE}&_language=${user.languageId}`
    })

    const seqNo = node?.current?.viewNodeId

    const currentNode = (initialData ?? []).find(n => Number(n.seqNo) === Number(seqNo))
    const existingTitles = currentNode?.titles ?? []

    const listView =
      titlesXMLList?.list
        ?.map((lang, index) => {
          const match = existingTitles.find(t => t.languageId?.toString() === lang.key)

          return {
            id: index + 1,
            languageId: parseInt(lang.key, 10),
            languageName: lang.value,
            title: match?.title ?? '',
            fsId: mainRecordId,
            seqNo
          }
        })
        .filter(Boolean) ?? []

    formik.setFieldValue('titles', listView)
  }

  useEffect(() => {
    getTitles()
  }, [node?.current?.viewNodeId, initialData.length])

  const ok = () => {
    const validTitles = (formik.values.titles ?? []).map(t => ({
      ...t,
      seqNo: node?.current?.viewNodeId,
      fsId: mainRecordId
    }))

    if (onOk) onOk(validTitles)
    window.close()
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: ok,
      disabled: false
    }
  ]

  return (
    <Form onSave={ok} maxAccess={maxAccess} isParentWindow={false} actions={actions} isSaved={false}>
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
    </Form>
  )
}

export default NodesTitleForm
