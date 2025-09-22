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

const LedgerForm = ({ store, labels, maxAccess, active }) => {
  const { nodeId, nodeRef } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const formik = useFormik({
    initialValues: {
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
          sign: null
        }
      ]
    },
    validationSchema: yup.object({
      ledgers: yup
        .array()
        .of(
          yup.object().shape({
            sign: yup.number().required()
          })
        )
        .required()
    }),
    onSubmit: async obj => {
      const data = {
        fsNodeId: nodeId,
        ledgers: (obj || []).map((ledger, index) => ({
          ...ledger,
          seqNo: index + 1
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
      name: 'seg0'
    },
    {
      component: 'textfield',
      label: labels.seg1,
      name: 'seg1'
    },
    {
      component: 'textfield',
      label: labels.seg2,
      name: 'seg2'
    },
    {
      component: 'textfield',
      label: labels.seg3,
      name: 'seg3'
    },
    {
      component: 'textfield',
      label: labels.seg4,
      name: 'seg4'
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
      id: index,
      ...ledger,
      signName: titlesMap.get(ledger.sign.toString()) || ''
    }))

    formik.setValues({ ledgers: updatedLedgers })
  }

  useEffect(() => {
    if (active && nodeId) getLedgers(nodeId)
  }, [nodeId, active])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FinancialStatements}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={true}
      isCleared={false}
    >
      {nodeId && (
        <VertLayout>
          <Grow>
            <CustomTextField name='nodeRef' label={labels.selectedNode} value={nodeRef} required readOnly />
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
      )}
    </FormShell>
  )
}

export default LedgerForm
