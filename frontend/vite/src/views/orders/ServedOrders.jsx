import BaseOrderManagement from './BaseOrderManagement';

const ServedOrders = () => {
  return (
    <BaseOrderManagement 
      title="Served Orders" 
      status="served" 
      apiEndpoint="/served" 
    />
  );
};

export default ServedOrders;