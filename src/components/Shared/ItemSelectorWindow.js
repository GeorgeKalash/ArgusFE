import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FormShell from './FormShell'

const ItemSelectorWindow = ({
  initialAllListData,
  initialSelectedListData,
  formik,
  handleListsDataChange,
  itemSelectorLabels
}) => {
  const [selected, setSelected] = useState([])
  const [allItems, setAllItems] = useState([])
  const [newSelected, setNewSelected] = useState([])
  const [newAll, setNewAll] = useState([])

  useEffect(() => {
    if (Array.isArray(initialAllListData)) {
      const updatedAllItems = initialAllListData.map(item => ({
        id: item.id,
        name: item.name
      }))
      setAllItems(updatedAllItems)
    }

    if (Array.isArray(initialSelectedListData)) {
      const updatedSelectedItems = initialSelectedListData.map(item => ({
        id: item.id,
        name: item.name
      }))
      setSelected(updatedSelectedItems)
    }
  }, [initialAllListData, initialSelectedListData])

  const handleToggle = value => {
    const isChecked = document.getElementById(value.id).checked

    if (selected.includes(value)) {
      if (isChecked === false) {
        setNewAll(prevSelected => prevSelected.filter(selectedItem => selectedItem.id !== value.id))
        setNewSelected(prevSelected => {
          if (!prevSelected.some(item => item.id === value.id)) {
            return [...prevSelected, value]
          }

          return prevSelected
        })
      } else {
        setNewAll(prevSelected => {
          if (!prevSelected.some(item => item.id === value.id)) {
            return [...prevSelected, value]
          }

          return prevSelected
        })
      }
    } else {
      if (isChecked === false) {
        setNewSelected(prevSelected => prevSelected.filter(selectedItem => selectedItem.id !== value.id))

        setNewAll(prevSelected => {
          if (!prevSelected.some(item => item.id === value.id)) {
            return [...prevSelected, value]
          }

          return prevSelected
        })
      } else {
        setNewSelected(prevSelected => {
          if (!prevSelected.some(item => item.id === value.id)) {
            return [...prevSelected, value]
          }

          return prevSelected
        })
      }
    }

    setAllItems(prevItems => prevItems.map(item => (item.id === value.id ? { ...item, checked: !item.checked } : item)))

    setSelected(prevItems => prevItems.map(item => (item.id === value.id ? { ...item, checked: !item.checked } : item)))
  }

  const handleMoveLeft = () => {
    let all = []

    setAllItems(prevItems => {
      const uniqueNewAll = newAll.filter(newAllItem => !prevItems.some(prevItem => prevItem.id === newAllItem.id))
      all = prevItems.concat(uniqueNewAll)

      return prevItems.concat(uniqueNewAll)
    })

    setSelected(prevItems => {
      const updatedItems = prevItems.filter(item => !newAll.some(selectedItem => selectedItem.id === item.id))

      handleListsDataChange(all, updatedItems)

      return updatedItems
    })

    setNewAll([])
    setNewSelected([])
  }

  const handleMoveRight = () => {
    let selected = []

    setSelected(prevSelected => {
      const uniqueNewSelected = newSelected.filter(
        newSelectedItem => !prevSelected.some(prevSelectedItem => prevSelectedItem.id === newSelectedItem.id)
      )
      selected = prevSelected.concat(uniqueNewSelected)

      return prevSelected.concat(uniqueNewSelected)
    })

    setAllItems(prevItems => {
      const updatedItems = prevItems.filter(item => !newSelected.some(selectedItem => selectedItem.id === item.id))

      handleListsDataChange(updatedItems, selected)

      return updatedItems
    })

    setNewSelected([])
    setNewAll([])
  }

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <div style={{ display: 'flex' }}>
        {/* Left List */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginLeft: '30px',
            flex: '1',
            textAlign: 'center',
            width: '50%',
            maxHeight: '380px',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ margin: '0', color: 'white', backgroundColor: 'black' }}>{itemSelectorLabels.title1}</h3>
          <div
            style={{
              maxHeight: '330px',
              height: '330px',
              overflowY: 'auto',
              border: '1px solid transparent'
            }}
          >
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {allItems.map(item => (
                <li
                  key={`key1_${item.id}`}
                  style={{ margin: '0', padding: '0', borderBottom: '1px solid transparent' }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                    <input
                      id={item.id}
                      type='checkbox'
                      onChange={() => handleToggle(item)}
                      checked={item.checked || false}
                      style={{ marginRight: '8px' }}
                    />
                    {item.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Centered Arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={handleMoveRight}>
            <ArrowForwardIcon />
          </IconButton>
          <IconButton onClick={handleMoveLeft}>
            <ArrowBackIcon />
          </IconButton>
        </div>

        {/* Right List */}
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginRight: '30px',
            flex: '1',
            textAlign: 'center',
            width: '50%',
            maxHeight: '380px',
            overflowY: 'auto'
          }}
        >
          <h3 style={{ margin: '0', color: 'white', backgroundColor: 'black' }}>{itemSelectorLabels.title2}</h3>

          <div
            style={{
              maxHeight: '330px',
              height: '330px',
              overflowY: 'auto',
              border: '1px solid transparent'
            }}
          >
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {selected.map(item => (
                <li
                  key={`key2_${item.id}`}
                  style={{ margin: '0', padding: '0', borderBottom: '1px solid transparent' }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                    <input
                      id={item.id}
                      type='checkbox'
                      onChange={() => handleToggle(item)}
                      checked={item.checked || false}
                      style={{ marginRight: '8px' }}
                    />
                    {item.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </FormShell>
  )
}

export default ItemSelectorWindow
