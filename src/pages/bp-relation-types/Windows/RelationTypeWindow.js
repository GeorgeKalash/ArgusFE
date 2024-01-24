// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import RelationTypeForm from '../forms/RelationTypeForm'

const RelationTypeWindow = ({
   onClose,
   labels,
   maxAccess,
   recordId
 }) => {
   
   return (
     <Window
       id='RelationTypeWindow'
       Title={labels.relationType}
       
       controlled={true}
       onClose={onClose}
       width={500}
       height={300}
     >
       <CustomTabPanel>
         <RelationTypeForm
           labels={labels}
           maxAccess={maxAccess}
           recordId={recordId}
         />
        
       </CustomTabPanel>
     </Window>
   )
 }
 

export default RelationTypeWindow
