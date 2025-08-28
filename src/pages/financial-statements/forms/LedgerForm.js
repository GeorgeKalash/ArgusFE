import { useFormik } from 'formik'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'

const LedgerForm = ({ store, setStore, labels, editMode, maxAccess }) => {
  const { recordId: fsId, nodes } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    validationSchema: yup.object({
      /* currencies: yup
        .array()
        .of(
          yup.object().shape({
            countryId: yup.string().required(),
            countryId: yup.string().required(),
            dispersalType: yup.string().required()
          })
        )
        .required() */
    }),
    initialValues: {
      ledgers: [
        {
          id: 1,
          fsId: fsId,
          seg0: '',
          seg1: '',
          seg2: '',
          seg3: '',
          seg4: '',
          signName: ''
        }
      ]
    },
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async values => {
      await post(values.currencies)
    }
  })

  const post = async obj => {
    const data = {
      productId: pId,
      productMonetaries: obj.map(({ id, productId, ...rest }) => ({
        productId: pId,
        ...rest
      }))
    }
    await postRequest({
      extension: RemittanceSettingsRepository.ProductMonetaries.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
      getMonetaries(pId)
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
      name: 'signName'

      /* props: {
      datasetId: DataSets.RT_Dispersal_Type,
        valueField: 'key',
        displayField: 'value',
        displayFieldWidth: 1,
        refresh: false,
        mapping: [
          { from: 'key', to: 'dispersalType' },
          { from: 'value', to: 'dispersalTypeName' }
        ]

        store: countries,
        valueField: 'countryId',
        displayField: 'countryRef',
        displayFieldWidth: 2,
        mapping: [
          { from: 'countryId', to: 'countryId' },
          { from: 'countryName', to: 'countryName' },
          { from: 'countryRef', to: 'countryRef' }
        ],
        columnsInDropDown: [
          { key: 'countryRef', value: 'Reference' },
          { key: 'countryName', value: 'Name' }
        ]
      } */
    }
  ]

  useEffect(() => {
    fsId && getMonetaries(fsId)
  }, [fsId])

  const getLedgers = fsNodeId => {
    const defaultParams = `_fsNodeId=${fsNodeId}`
    var parameters = defaultParams
    getRequest({
      extension: FinancialStatementRepository.Ledger.qry,
      parameters: parameters
    }).then(res => {
      if (res?.list.length > 0)
        formik.setValues({
          ledgers: res.list.map(({ ...rest }, index) => ({
            id: index,
            ...rest
          }))
        })

      /*  const uniqueCurrencies = res.list.filter(
        (item, index, self) =>
          index === self.findIndex(t => t.currencyId === item.currencyId && t.countryId === item.countryId)
      ) */
      setStore(prevStore => ({
        ...prevStore,
        ledgers: res.list
      }))
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
      <VertLayout>
        <Grow>
          <DataGrid
            name='rows'
            onChange={value => formik.setFieldValue('ledgers', value)}
            value={formik.values.ledgers}
            error={formik.errors.ledgers}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default LedgerForm
