import BaseOrderManagement from './BaseOrderManagement';

const PreparingOrders = () => {
  return (
    <BaseOrderManagement 
      title="Preparing Orders" 
      status="preparing" 
      apiEndpoint="/preparing" 
    />
  );
};

export default PreparingOrders;