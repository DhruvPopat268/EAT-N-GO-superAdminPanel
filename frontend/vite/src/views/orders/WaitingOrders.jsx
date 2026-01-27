import BaseOrderManagement from './BaseOrderManagement';

const WaitingOrders = () => {
  return (
    <BaseOrderManagement 
      title="Waiting Orders" 
      status="waiting" 
      apiEndpoint="/waiting" 
    />
  );
};

export default WaitingOrders;