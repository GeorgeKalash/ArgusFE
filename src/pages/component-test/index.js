import { Button } from '@mui/material'
import { useState } from 'react'
import { FormDataGrid } from 'src/components/Shared/DataGrid'

async function getRate() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(14.2)
    }, 1000)
  })
}

export default function Page() {
  const [rows, setRows] = useState([
    {
      id: 2,
      firstname: 'Hadi',
      lastname: 'Chahine'
    }
  ])

  console.log(rows)

  return (
    <>
      <Button
        onClick={() => {
          setRows([
            ...rows,
            {
              id: 1,
              name: 'Chahine'
            }
          ])
        }}
      >
        Change
      </Button>
      <FormDataGrid
        onChange={setRows}
        value={rows}
        columns={[
          {
            component: 'textfield',
            name: 'firstname',
            onChange({ row: { update, values } }) {
              update({
                fullname: values.firstname
              })
            }
          },
          {
            component: 'textfield',
            name: 'lastname',
            onChange({ row: { update, values } }) {
              update({
                fullname: values.lastname
              })
            }
          },
          {
            component: 'textfield',
            name: 'fullname'
          }
        ]}
      />
    </>
  )
}
