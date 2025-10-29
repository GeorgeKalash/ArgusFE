import { useContext, useEffect, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Form from 'src/components/Shared/Form'

export default function FlagsForm({ nodeForm, labels, maxAccess, window }) {
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [data, setData] = useState([])

  async function getAllFlags() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.GLFS_FLAGS,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  const columns = [
    {
      field: 'isChecked',
      headerName: '',
      type: 'checkbox',
      editable: true
    },
    {
      field: 'value',
      headerName: labels.name,
      flex: 1
    }
  ]

  function gridToDecimal(flags) {
    let decimalValue = 0

    for (let i = 0; i < flags.length; i++) decimalValue += (flags[i] ? 1 : 0) * Math.pow(2, i)

    return decimalValue
  }

  function convertDecimalToArrayBool(flags, count) {
    const list = []

    while (flags > 0) {
      const b = flags % 2
      flags = Math.floor(flags / 2)
      list.push(Boolean(b))
    }

    while (list.length < count) list.push(false)
    list.reverse()

    return list
  }

  const handleSubmit = () => {
    const checkedFlags = data?.map(item => item.isChecked ?? false)
    const decimalFlagValue = gridToDecimal(checkedFlags)
    nodeForm.setFieldValue('flags', decimalFlagValue)
    window.close()
  }

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => handleSubmit()
    }
  ]

  useEffect(() => {
    ;(async function () {
      const flags = await getAllFlags()
      const listBool = convertDecimalToArrayBool(nodeForm.values.flags, flags.length)

      const listFlags = flags.map((item, index) => ({
        isChecked: listBool[index] || false,
        key: item.key,
        value: item.value
      }))

      setData(listFlags)
    })()
  }, [])

  return (
    <Form onSave={handleSubmit} actions={actions} maxAccess={maxAccess} isSaved={false} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <Table
            name='flagsTable'
            columns={columns}
            gridData={{ list: data }}
            rowId={['key']}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}
