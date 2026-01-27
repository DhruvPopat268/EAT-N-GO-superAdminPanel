import BaseOrderManagement from './BaseOrderManagement';

const ConfirmedOrders = () => {
  return (
    <BaseOrderManagement 
      title="Confirmed Orders" 
      status="confirmed" 
      apiEndpoint="/confirmed" 
    />
  );
};

export default ConfirmedOrders;