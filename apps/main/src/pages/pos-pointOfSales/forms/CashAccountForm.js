import { useFormik } from 'formik'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'

import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { PointofSaleRepository } from '@argus/repositories/src/repositories/PointofSaleRepository'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CashAccountForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const formik = useFormik({
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
        getData()
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
        displayField: ['name', 'reference'],
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'cashAccountId' },
          { from: 'name', to: 'cashAccountName' },
          { from: 'reference', to: 'cashAccountRef' },
          { from: 'typeName', to: 'typeName' }
        ],

        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'reference', value: 'Reference' }
        ]
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
    getRequest({
      extension: PointofSaleRepository.CashAccount.qry,
      parameters: `_posId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((user, index) => ({
          ...user,
          id: index + 1
        }))
        formik.setValues({ pOSUser: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('pOSUser', value)}
            value={formik.values.pOSUser || []}
            error={formik.errors.pOSUser}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CashAccountForm
