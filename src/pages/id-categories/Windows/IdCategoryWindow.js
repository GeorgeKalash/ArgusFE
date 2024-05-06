// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import IdCategoryForm from '../forms/IdCategoryForm'

const IdCategoriesWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window id='IdCategoriesWindow' Title={labels.idCategory} controlled={true} onClose={onClose}>
      <IdCategoryForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default IdCategoriesWindow
