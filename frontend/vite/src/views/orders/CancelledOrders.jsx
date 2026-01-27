import BaseOrderManagement from './BaseOrderManagement';

const CancelledOrders = () => {
  return (
    <BaseOrderManagement 
      title="Cancelled Orders" 
      status="cancelled" 
      apiEndpoint="/cancelled" 
    />
  );
};

export default CancelledOrders;