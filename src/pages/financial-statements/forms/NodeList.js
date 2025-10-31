import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { DataGrid } from 'src/components/Shared/DataGrid'
import Form from 'src/components/Shared/Form'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form'
import FlagsForm from './FlagsForm'
import NodesTitleForm from './NodesTitleForm'

const NodeList = ({ node, mainRecordId, labels, maxAccess, fetchData, initialData }) => {
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const updateNodeFlags = (seqNo, newFlagsValue) => {
    formik.setFieldValue(
      'items',
      formik.values.items.map(item => (item.seqNo === seqNo ? { ...item, flags: newFlagsValue } : item))
    )
  }

  const parents = useRef([])

  const onOk = newTitles => {
    const existingTitles = formik.values.titles ?? []
    const mergedTitles = [...existingTitles]

    const seqNo = node.current?.nodeId
    const filteredExisting = mergedTitles.filter(t => t.seqNo !== seqNo)

    const newValues = newTitles.filter(t => !!t.languageId)

    formik.setFieldValue('titles', [...filteredExisting, ...newValues])
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.reference,
      name: 'reference',
      props: {
        maxLength: 10
      },
      flex: 1
    },
    {
      component: 'resourcecombobox',
      label: labels.parent,
      name: 'parentSeqNo',
      props: {
        store: parents?.current,
        valueField: 'seqNo',
        displayField: 'reference',
        mapping: [
          { from: 'seqNo', to: 'parentSeqNo' },
          { from: 'reference', to: 'parentRef' }
        ],
        displayFieldWidth: 2
      },
      propsReducer({ row, props }) {
        return { ...props, store: parents?.current }
      },
      flex: 1
    },
    {
      component: 'resourcecombobox',
      label: labels.format,
      name: 'numberFormat',
      props: {
        datasetId: DataSets.GLFS_NB_FORMAT,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'numberFormat' },
          { from: 'value', to: 'numberFormatName' }
        ],
        displayFieldWidth: 2
      },
      flex: 2
    },
    {
      component: 'resourcecombobox',
      label: labels.amount,
      name: 'amountSource',
      props: {
        datasetId: DataSets.GLFS_SIGN,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'amountSource' },
          { from: 'value', to: 'amountSourceName' }
        ],
        displayFieldWidth: 2
      },
      flex: 2
    },
    {
      component: 'numberfield',
      label: labels.order,
      name: 'displayOrder',
      props: {
        allowNegative: false,
        maxLength: 4
      },
      flex: 1
    },
    {
      component: 'textfield',
      label: labels.description,
      name: 'description',
      props: {
        maxLength: 40
      }
    },
    {
      component: 'button',
      name: 'flag',
      flex: 0.75,
      label: labels.flag,
      onClick: (e, row) => {
        stack({
          Component: FlagsForm,
          props: {
            nodeForm: row,
            labels,
            maxAccess,
            updateNodeFlags
          },
          width: 700,
          title: labels.flags
        })
      }
    },
    {
      component: 'button',
      name: 'nodeTitle',
      flex: 0.75,
      label: labels.title,
      onClick: () => {
        stack({
          Component: NodesTitleForm,
          props: {
            node,
            labels,
            maxAccess,
            mainRecordId,
            initialData: formik.values.titles,
            onOk
          },
          width: 700,
          title: labels.nodesTitle
        })
      }
    }
  ]

  const { formik } = useForm({
    initialValues: {
      fsId: mainRecordId,
      items: [
        {
          id: 1,
          fsId: mainRecordId || 0,
          reference: '',
          parentSeqNo: null,
          numberFormat: null,
          displayOrder: null,
          description: '',
          flag: true,
          seqNo: 1,
          flags: 0
        }
      ],
      titles: initialData?.titles ?? []
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          reference: yup.string().required(),
          displayOrder: yup.number().required(),
          numberFormat: yup.number().required(),
          amountSource: yup.number().required()
        })
      )
    }),
    onSubmit: async values => {
      const itemsWithSeq =
        values.items?.map((row, index) => ({
          ...row,
          seqNo: index + 1,
          fsId: mainRecordId
        })) ?? []

      const validSeqNos = itemsWithSeq.map(i => i.seqNo)

      const filteredTitles =
        values.titles
          ?.filter(t => validSeqNos.includes(t.seqNo) && !!t.languageId && t.title?.trim())
          ?.map(t => ({
            ...t,
            fsId: mainRecordId
          })) ?? []

      const data = { fsId: mainRecordId, items: itemsWithSeq, titles: filteredTitles }

      const res = await postRequest({
        extension: FinancialStatementRepository.Node.set2,
        record: JSON.stringify(data)
      })

      node.current.nodeId = res.recordId
      toast.success(platformLabels.Edited)
      fetchData()
    }
  })

  useEffect(() => {
    if (!mainRecordId) return

    if (initialData?.nodes?.length) {
      if (!formik.values.items[0].reference) {
        parents.current = initialData.nodes

        formik.setValues({
          ...formik.values,
          fsId: mainRecordId,
          items: initialData.nodes.map((node, i) => {
            const nodeTitles =
              initialData.titles
                ?.filter(t => t.seqNo === node.seqNo)
                ?.map(t => ({
                  languageId: t.languageId,
                  title: t.title
                })) ?? []

            return {
              id: i + 1,
              titles: nodeTitles,
              ...node
            }
          }),
          titles: initialData.titles ?? []
        })
      }
    }
  }, [mainRecordId, initialData?.nodes?.length])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='items'
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={maxAccess}
            initialValues={formik.initialValues.items?.[0]}
            onSelectionChange={row => {
              node.current.nodeId = row?.id || null
              node.current.viewNodeId = row?.id || null
              node.current.viewNodeRef = row?.reference || ''
              node.current.viewNodedesc = row?.description || ''
            }}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default NodeList
