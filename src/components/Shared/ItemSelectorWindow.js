import { useContext, useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FormShell from './FormShell'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import { Grid } from '@mui/material'
import FieldSet from './FieldSet'
import { AuthContext } from 'src/providers/AuthContext'

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
  const { languageId } = useContext(AuthContext)

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
      <VertLayout>
        <Fixed>
          <Grid container xs={12}>
            <Grid item xs={5}>
              <FieldSet title={itemSelectorLabels.title1}>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {allItems.map(item => (
                    <li key={`key1_${item.id}`} style={{ margin: '0', padding: '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                        <input
                          id={item.id}
                          type='checkbox'
                          onChange={() => handleToggle(item)}
                          checked={item.checked || false}
                        />
                        {item.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </FieldSet>
            </Grid>
            <Grid item xs={2}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }} onClick={handleMoveRight}>
                  <ArrowForwardIcon />
                </IconButton>
                <IconButton sx={{ transform: languageId === 2 ? 'rotate(180deg)' : 'none' }} onClick={handleMoveLeft}>
                  <ArrowBackIcon />
                </IconButton>
              </div>
            </Grid>
            <Grid item xs={5}>
              <FieldSet title={itemSelectorLabels.title2}>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {selected.map(item => (
                    <li key={`key2_${item.id}`} style={{ margin: '0', padding: '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                        <input
                          id={item.id}
                          type='checkbox'
                          onChange={() => handleToggle(item)}
                          checked={item.checked || false}
                        />
                        {item.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </FieldSet>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

export default ItemSelectorWindow
