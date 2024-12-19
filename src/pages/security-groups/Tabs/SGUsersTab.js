import { useForm } from 'src/hooks/form'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'

const SGUsersTab = ({ labels, maxAccess, storeRecordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = storeRecordId

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      groups: [
        {
          id: 1,
          sgId: '',
          sgName: '',
          email: '',
          userId: ''
        }
      ]
    },
    onSubmit: async values => {
      await postGroups(values)
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'sgId',
      label: labels.name,
      props: {
        endpointId: AccessControlRepository.SecurityGroupUser.qry,
        parameters: `_userId=0&_filter=&_sgId=0`,
        valueField: 'sgId',
        displayField: 'fullName',
        columnsInDropDown: [
          { key: 'fullName', value: 'Name' },
          { key: 'email', value: 'Email' }
        ],
        mapping: [
          { from: 'sgId', to: 'sgId' },
          { from: 'sgName', to: 'sgName' },
          { from: 'email', to: 'email' },
          { from: 'userId', to: 'userId' },
          { from: 'fullName', to: 'fullName' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.email,
      name: 'email',
      props: {
        readOnly: true
      }
    }
  ]

  const postGroups = async obj => {
    const groups = obj?.groups?.length
      ? obj.groups
          .filter(item => item.sgId)
          .map(item => ({
            sgId: recordId,
            userId: item.userId
          }))
      : []

    const data = {
      userId: 0,
      sgId: recordId,
      groups
    }

    await postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }

  useEffect(() => {
    if (recordId) {
      getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: `_userId=0&_filter=&_sgId=${recordId}`
      }).then(res => {
        if (res?.list?.length > 0) {
          const items = res.list.map((item, index) => ({
            ...item,
            id: index + 1
          }))
          formik.setValues({ groups: items })
        }
      })
    }
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Users}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={!!recordId}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('groups', value)}
            value={formik.values.groups}
            error={formik.errors.groups}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default SGUsersTab
