import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'

const CashAccountForm = ({ store, labels, maxAccess, editMode }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      pOSUser: yup
        .array()
        .of(
          yup.object().shape({
            cashAccountId: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      pOSUser: [
        {
          id: 1,
          posId: recordId,
          cashAccountId: '',
          name: '',
          type: '',
          isInactive: false
        }
      ]
    },
    onSubmit: values => {
      postPOSUser(values)
    }
  })
  console.log(formik.values.pOSUser)

  const postPOSUser = obj => {
    const pOSUser = obj?.pOSUser?.map(({ posId, ...rest }) => ({
      posId: recordId,

      ...rest
    }))

    const data = {
      posId: recordId,
      users: pOSUser
    }
    postRequest({
      extension: PointofSaleRepository.CashAccount.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
        if (res) getData()
      })
      .catch(error => {})
  }

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.caAcc,
      name: 'cashAccountId',
      props: {
        endpointId: CashBankRepository.CbBankAccounts.qry,
        parameters: `_type=0`,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'cashAccountId' },
          { from: 'name', to: 'cashAccountName' },
          { from: 'reference', to: 'cashAccountRef' },
          { from: 'typeName', to: 'typeName' }
        ],

        columnsInDropDown: [{ key: 'name', value: 'Name' }]
      }
    },

    {
      component: 'textfield',
      label: labels.type,
      name: 'typeName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'checkbox',
      label: labels.isInactive,
      name: 'isInactive'
    }
  ]

  function getData() {
    const defaultParams = `_posId=${recordId}`
    var parameters = defaultParams
    recordId &&
      getRequest({
        extension: PointofSaleRepository.CashAccount.qry,
        parameters: parameters
      })
        .then(res => {
          if (Array.isArray(res?.list) && res.list.length > 0) {
            formik.setValues({
              pOSUser: res.list.map(({ ...rest }, index) => ({
                id: index,
                ...rest
              }))
            })
          } else {
            formik.setValues({
              posId: [
                {
                  id: 1,
                  posId: recordId,
                  cashAccountId: '',
                  type: '',
                  isInactive: false
                }
              ]
            })
          }
        })
        .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  console.log('DataGrid value:', formik.values.pOSUser)

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.PointOfSales}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('pOSUser', value)}
            value={formik.values.pOSUser || []}
            error={formik.errors.pOSUser}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default CashAccountForm
