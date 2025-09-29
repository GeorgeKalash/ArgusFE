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
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { AuthContext } from 'src/providers/AuthContext'
import { createConditionalSchema } from 'src/lib/validation'
import { useError } from 'src/error'

const LedgerForm = ({ node, labels, maxAccess }) => {
  const { nodeId, nodeRef } = node?.current
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)
  const { stack: stackError } = useError()

  const conditions = {
    sign: row => {
      const hasSeg = row?.seg0 || row?.seg1 || row?.seg2 || row?.seg3 || row?.seg4 || row?.ccRef || row?.ccgRef

      return hasSeg ? true : !!row.sign
    }
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'ledgers')

  const formik = useFormik({
    initialValues: {
      nodeRef,
      ledgers: [
        {
          id: 1,
          seqNo: 1,
          fsNodeId: nodeId,
          seg0: '',
          seg1: '',
          seg2: '',
          seg3: '',
          seg4: '',
          ccgRef: '',
          ccRef: '',
          sign: ''
        }
      ]
    },
    enableReinitialize: true,
    conditionSchema: ['ledgers'],
    validationSchema: yup.object({
      nodeRef: yup.string().required(),
      ledgers: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const hasInvalidLedger = obj?.ledgers?.some(l => !l.seg0 && !l.seg1 && !l.seg2 && !l.seg3 && !l.seg4 && l.sign)

      if (hasInvalidLedger) {
        stackError({
          message: labels.mandatorySeg
        })

        return
      }

      const data = {
        fsNodeId: nodeId,
        ledgers: obj?.ledgers
          ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
          ?.map((ledger, index) => ({
            ...ledger,
            seqNo: index + 1,
            fsNodeId: nodeId
          }))
      }

      await postRequest({
        extension: FinancialStatementRepository.Ledger.set2,
        record: JSON.stringify(data)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.seg0,
      name: 'seg0',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg1,
      name: 'seg1',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg2,
      name: 'seg2',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg3,
      name: 'seg3',
      props: {
        maxLength: 8
      }
    },
    {
      component: 'textfield',
      label: labels.seg4,
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
    },
    {
      component: 'resourcecombobox',
      label: labels.sign,
      name: 'sign',
      props: {
        datasetId: DataSets.GLFS_SIGN,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 1.5,
        mapping: [
          { from: 'key', to: 'sign' },
          { from: 'value', to: 'signName' }
        ]
      }
    }
  ]

  async function getLedgers(fsNodeId) {
    const res = await getRequest({
      extension: FinancialStatementRepository.Ledger.qry,
      parameters: `_fsNodeId=${fsNodeId}`
    })

    const ledgers = res?.list ?? []
    if (ledgers.length === 0) return

    const titlesXML = await getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: `_dataset=${DataSets.GLFS_SIGN}&_language=${user.languageId}`
    })

    const titlesMap = new Map((titlesXML?.list ?? []).map(item => [item.key, item.value]))

    const updatedLedgers = ledgers.map((ledger, index) => ({
      id: index + 1,
      ...ledger,
      signName: titlesMap.get(ledger.sign.toString()) || ''
    }))

    formik.setFieldValue('ledgers', updatedLedgers)
  }

  useEffect(() => {
    if (nodeId) getLedgers(nodeId)
  }, [nodeId])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FinancialStatements}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={true}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <CustomTextField
            name='nodeRef'
            label={labels.selectedNode}
            value={nodeRef}
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
    </FormShell>
  )
}

export default LedgerForm
