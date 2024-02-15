import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import ProductionClassForm from '../forms/ProductionClassForm'

const ProductionClassWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='productionClass'
      Title={labels.prodClass}
      controlled={true}
      onClose={onClose}
      width={500}
      height={400}
    >
      <CustomTabPanel>
        <ProductionClassForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
    </Window>
  )
}

export default ProductionClassWindow
