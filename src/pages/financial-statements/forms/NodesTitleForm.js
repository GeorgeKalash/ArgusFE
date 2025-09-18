import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { AuthContext } from 'src/providers/AuthContext'

const NodesTitleForm = ({ labels, maxAccess, store, toggleUpdateTree }) => {
  const { recordId: nodeId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const formik = useFormik({
    initialValues: {
      titles: [
        {
          fsNodeId: nodeId,
          languageId: null,
          languageName: '',
          title: ''
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async values => {
      await post(values.titles.filter(line => line.title))
    }
  })

  const post = async obj => {
    const data = {
      fsNodeId: nodeId,
      titles: obj.map(({ id, seqNo, ...rest }) => ({
        seqNo: id,
        ...rest
      }))
    }

    await postRequest({
      extension: FinancialStatementRepository.Title.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
    })

    toggleUpdateTree()
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.language,
      name: 'languageName'
    },
    {
      component: 'textfield',
      label: labels.title,
      name: 'title'
    }
  ]

  useEffect(() => {
    nodeId && getTitles(nodeId)
  }, [nodeId])

  const getTitles = nodeId => {
    const defaultParams = `_fsNodeId=${nodeId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialStatementRepository.Title.qry,
      parameters: parameters
    }).then(async res => {
      const listView = []
      var _dataset = DataSets.LANGUAGE
      var _language = user.languageId
      var parameters = `_dataset=${_dataset}&_language=${_language}`

      const titlesXMLList = await getRequest({
        extension: SystemRepository.KeyValueStore,
        parameters: parameters
      })

      titlesXMLList?.list?.forEach(x => {
        const lang = res?.list?.find(item => item.languageId.toString() === x.key)

        console.log('lang', lang)

        const titleView = {
          languageId: parseInt(x.key, 10),
          title: lang?.title,
          fsNodeId: parseInt(nodeId, 10),
          languageName: x.value
        }

        console.log('title', titleView)

        listView.push(titleView)
      })

      console.log('test', listView)

      formik.setValues({
        titles: listView.map(({ ...rest }, index) => ({
          id: index,
          ...rest
        }))
      })
    })
  }

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
            name='rows'
            onChange={value => formik.setFieldValue('titles', value)}
            value={formik.values.titles}
            error={formik.errors.titles}
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
