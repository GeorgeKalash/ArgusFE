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

const LedgerForm = ({ store, labels, editMode, maxAccess, active }) => {
  const { nodeId, nodeRef } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const formik = useFormik({
    validationSchema: yup.object({
      ledgers: yup
        .array()
        .of(
          yup.object().shape({
            sign: yup.string().required()
          })
        )
        .required()
    }),
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
          sign: null,
          signName: null
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async values => {
      await post(values.ledgers)
    }
  })

  const post = async obj => {
    const data = {
      fsNodeId: nodeId,
      ledgers: obj.map(({ id, seqNo, ...rest }) => ({
        seqNo: id,
        ...rest
      }))
    }
    console.log('data', data)
    await postRequest({
      extension: FinancialStatementRepository.Ledger.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      //getMonetaries(pId)
    })
  }

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
      name: 'signName',
      props: {
        datasetId: DataSets.GLFS_SIGN,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 1.25,

        //refresh: false,
        mapping: [
          { from: 'key', to: 'sign' },
          { from: 'value', to: 'signName' }
        ]
      }
    }
  ]

  useEffect(() => {
    if (active && nodeId) getLedgers(nodeId)
  }, [nodeId, active])

  const getLedgers = fsNodeId => {
    const defaultParams = `_fsNodeId=${fsNodeId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialStatementRepository.Ledger.qry,
      parameters: parameters
    }).then(async res => {
      if (res?.list.length > 0) {
        var _dataset = DataSets.GLFS_SIGN
        var _language = user.languageId
        var parameters = `_dataset=${_dataset}&_language=${_language}`

        const titlesXMLList = await getRequest({
          extension: SystemRepository.KeyValueStore,
          parameters: parameters
        })

        console.log('titlesXMLList', titlesXMLList)

        const updatedLedger = res?.list?.map(x => {
          const match = titlesXMLList?.list?.find(item => item.key === x.sign.toString())

          console.log('match', match)

          return {
            ...x,
            signName: match ? match.value : ''
          }
        })

        console.log('updatedLedger', updatedLedger)

        formik.setValues({
          ledgers: updatedLedger.map(({ ...rest }, index) => ({
            id: index,
            ...rest
          }))
        })

        /*  setStore(prevStore => ({
          ...prevStore,
          ledgers: updatedLedger
        })) */
      } else {
        formik.setValues({
          ledgers: []
        })
      }
    })
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FinancialStatements}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
      isCleared={false}
    >
      {active && nodeId && (
        <VertLayout>
          <Grow>
            <CustomTextField
              name='nodeRef'
              label={labels.selectedNode}
              value={nodeRef}
              required
              readOnly
              maxAccess={maxAccess}
            />
            <DataGrid
              name='rows'
              onChange={value => formik.setFieldValue('ledgers', value)}
              value={formik.values.ledgers}
              error={formik.errors.ledgers}
              columns={columns}
            />
          </Grow>
        </VertLayout>
      )}
    </FormShell>
  )
}

export default LedgerForm
