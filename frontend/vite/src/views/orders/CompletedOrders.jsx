import BaseOrderManagement from './BaseOrderManagement';

const CompletedOrders = () => {
  return (
    <BaseOrderManagement 
      title="Completed Orders" 
      status="completed" 
      apiEndpoint="/completed" 
    />
  );
};

export default CompletedOrders;