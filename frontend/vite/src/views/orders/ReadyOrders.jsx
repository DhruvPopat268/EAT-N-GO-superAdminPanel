import BaseOrderManagement from './BaseOrderManagement';

const ReadyOrders = () => {
  return (
    <BaseOrderManagement 
      title="Ready Orders" 
      status="ready" 
      apiEndpoint="/ready" 
    />
  );
};

export default ReadyOrders;