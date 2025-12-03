import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialStatementRepository } from '@argus/repositories/src/repositories/FinancialStatementRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import FlagsForm from './FlagsForm'
import NodesTitleForm from './NodesTitleForm'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'

const NodeList = ({ node, mainRecordId, labels, maxAccess, fetchData, initialData }) => {
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const parents = useRef([])

  const updateNodeFlags = (seqNo, newFlagsValue) => {
    formik.setFieldValue(
      'items',
      formik.values.items.map(item => (item.seqNo === seqNo ? { ...item, flags: newFlagsValue } : item))
    )
  }

  const conditions = {
    reference: row => row?.reference != null,
    displayOrder: row => row?.displayOrder != null,
    numberFormat: row => row?.numberFormat != null,
    amountSource: row => row?.amountSource != null
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'data')

  const { formik } = useForm({
    conditionSchema: ['items'],
    maxAccess,
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
          seqNo: null,
          flags: 0
        }
      ],
      titles: initialData?.titles ?? []
    },
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const itemsWithSeq =
        values.items
          ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
          .map(row => ({
            ...row,
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

      await postRequest({
        extension: FinancialStatementRepository.Node.set2,
        record: JSON.stringify(data)
      })

      const selectedNode = itemsWithSeq.find(i => Number(i.seqNo) === Number(node.current?.viewNodeId))

      if (selectedNode) {
        node.current.viewNodeRef = selectedNode.reference || ''
        node.current.viewNodedesc = selectedNode.description || ''
      }

      toast.success(platformLabels.Edited)
      const newData = await fetchData()
      setData(newData)
    }
  })

  const onOk = newTitles => {
    const existingTitles = formik.values.titles ?? []

    const filteredExisting = [...existingTitles].filter(t => t.seqNo !== node.current?.viewNodeId)
    const newValues = newTitles.filter(t => !!t.languageId)

    const updatedTitles = [...filteredExisting, ...newValues]
    formik.setFieldValue('titles', updatedTitles)

    formik.setFieldValue(
      'items',
      formik.values.items.map(item =>
        item.seqNo == node.current?.viewNodeId
          ? {
              ...item,
              titles: newValues
            }
          : item
      )
    )
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
        displayFieldWidth: 2,
        refresh: false
      },
      propsReducer({ row, props }) {
        return { ...props, store: parents.current.filter(p => p.seqNo != row?.seqNo) }
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
        maxLength: 4,
        decimalScale: 0
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
            initialData: formik.values.items,
            onOk
          },
          width: 700,
          title: labels.nodesTitle
        })
      }
    }
  ]

  const setData = data => {
    formik.setValues({
      ...formik.values,
      fsId: mainRecordId,
      items:
        data.nodes.length > 0
          ? data.nodes.map((node, i) => {
              const nodeTitles =
                data.titles
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
            })
          : formik.initialValues.items,
      titles: data.titles ?? []
    })
  }

  useEffect(() => {
    if (!mainRecordId) return

    if (initialData?.nodes?.length && !formik?.values?.items[0]?.reference) {
      parents.current = initialData.nodes.map((n, i) => ({
        ...n,
        id: n.seqNo ?? i + 1
      }))
    }

    setData(initialData)
  }, [initialData?.nodes])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            name='items'
            onChange={(value, action) => {
              if (action === 'delete') {
                node.current.viewNodeId = null
                node.current.viewNodeRef = ''
                node.current.viewNodedesc = ''
              }

              const normalized = value.map(v => ({
                ...v,
                seqNo: v.seqNo ?? (value?.length ? Math.max(...value.map(item => item.seqNo)) : 0) + 1
              }))

              parents.current = normalized
              formik.setFieldValue('items', normalized)
            }}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={maxAccess}
            initialValues={formik.initialValues.items?.[0]}
            onSelectionChange={row => {
              node.current.viewNodeId = row?.seqNo || null
              node.current.viewNodeRef = row?.reference || ''
              node.current.viewNodedesc = row?.description || ''
            }}
            isDeleteDisabled={row => formik.values.items?.find(item => item?.parentSeqNo == row?.seqNo)}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default NodeList
