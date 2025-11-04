import { useFormik } from 'formik'
import { useContext, useEffect, useRef } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import Form from 'src/components/Shared/Form'
import { useError } from 'src/error'

const LedgerForm = ({ node, labels, maxAccess, mainRecordId, initialData, fetchData }) => {
  const { viewNodeId: nodeId, viewNodeRef: nodeRef, viewNodedesc: nodedesc } = node?.current || {}

  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const lastValidNodeId = useRef(nodeId || null)
  const { stack: stackError } = useError()

  const makeInitialValues = seqNo => ({
    nodeRef,
    ledgers: [
      {
        id: 1,
        seqNo: seqNo || null,
        seg0: '',
        seg1: '',
        seg2: '',
        seg3: '',
        seg4: '',
        ccgRef: '',
        ccRef: ''
      }
    ]
  })

  const formik = useFormik({
    initialValues: makeInitialValues(nodeId),
    validationSchema: yup.object({
      nodeRef: yup.string().required()
    }),
    onSubmit: async obj => {
      const hasInvalidLedger = obj?.ledgers?.some(l => !l.seg0 && !l.seg1 && !l.seg2 && !l.seg3 && !l.seg4)

      if (hasInvalidLedger) {
        stackError({
          message: labels.mandatorySeg
        })

        return
      }

      const data = {
        fsId: mainRecordId,
        seqNo: nodeId,
        ledgers: obj?.ledgers?.map((ledger, index) => ({
          ...ledger,
          seqNo: nodeId,
          ledgerSeqNo: index + 1
        }))
      }

      await postRequest({
        extension: FinancialStatementRepository.Ledger.set2,
        record: JSON.stringify(data)
      })

      fetchData()
      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.seg1,
      name: 'seg0',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg2,
      name: 'seg1',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg3,
      name: 'seg2',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg4,
      name: 'seg3',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg5,
      name: 'seg4',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.ccgRef,
      name: 'ccgRef',
      props: {
        maxLength: 10
      }
    },
    {
      component: 'textfield',
      label: labels.ccRef,
      name: 'ccRef',
      props: {
        maxLength: 10
      }
    }
  ]

  useEffect(() => {
    if (!mainRecordId) return

    if (initialData?.length && nodeId) {
      const nodeLedgers = initialData.filter(l => Number(l.seqNo) === Number(nodeId))

      const normalized = nodeLedgers.map((l, i) => ({
        id: i + 1,
        ...l
      }))

      formik.setValues({
        nodeRef,
        ledgers: normalized.length ? normalized : makeInitialValues(nodeId).ledgers
      })

      return
    }

    if (nodeId) {
      lastValidNodeId.current = nodeId

      formik.resetForm({ values: makeInitialValues(nodeId) })
    } else {
      formik.resetForm({ values: makeInitialValues(null) })
    }
  }, [nodeId, mainRecordId, initialData])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <CustomTextField
            name='nodeRef'
            label={labels.selectedNode}
            value={`${nodeRef || ''}  ${nodedesc || ''}`}
            required
            readOnly
            error={formik.touched.nodeRef && Boolean(formik.errors.nodeRef)}
          />
          <DataGrid
            name='ledgerTable'
            onChange={value => formik.setFieldValue('ledgers', value)}
            value={formik.values.ledgers}
            error={formik.errors.ledgers}
            columns={columns}
            maxAccess={maxAccess}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default LedgerForm
