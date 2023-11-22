import React, { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Box } from '@mui/material'

const InlineEditGrid = () => {
  const [products, setProducts] = useState([
    {
      id: '1000',
      code: 'f230fh0g3',
      name: 'Bamboo Watch',
      description: 'Product Description',
      image: 'bamboo-watch.jpg',
      price: 65,
      category: 'Accessories',
      quantity: 24,
      inventoryStatus: 'INSTOCK',
      rating: 5
    }
  ])

  const columns = [
    { field: 'code', header: 'Code' },
    { field: 'name', header: 'Name' },
    { field: 'quantity', header: 'Quantity' },
    { field: 'price', header: 'Price' }
  ]

  const isPositiveInteger = val => {
    let str = String(val)

    str = str.trim()

    if (!str) {
      return false
    }

    str = str.replace(/^0+/, '') || '0'
    let n = Math.floor(Number(str))

    return n !== Infinity && String(n) === str && n >= 0
  }

  const onCellEditComplete = e => {
    let { rowData, newValue, field, originalEvent: event } = e

    switch (field) {
      case 'quantity':
      case 'price':
        if (isPositiveInteger(newValue)) rowData[field] = newValue
        else event.preventDefault()
        break

      default:
        if (newValue.trim().length > 0) rowData[field] = newValue
        else event.preventDefault()
        break
    }
  }

  const cellEditor = options => {
    if (options.field === 'price') return priceEditor(options)
    else return textEditor(options)
  }

  const textEditor = options => {
    return <InputText type='text' value={options.value} onChange={e => options.editorCallback(e.target.value)} />
  }

  const priceEditor = options => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={e => options.editorCallback(e.value)}
        mode='currency'
        currency='USD'
        locale='en-US'
      />
    )
  }

  const priceBodyTemplate = rowData => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rowData.price)
  }
  console.log({ products })

  return (
    <Box>
      <DataTable value={products} editMode='cell' tableStyle={{ minWidth: '50rem' }}>
        {columns.map(({ field, header }) => {
          return (
            <Column
              key={field}
              field={field}
              header={header}
              style={{ width: '25%' }}
              body={field === 'price' && priceBodyTemplate}
              editor={options => cellEditor(options)}
              onCellEditComplete={onCellEditComplete}
            />
          )
        })}
      </DataTable>
    </Box>
  )
}

export default InlineEditGrid
