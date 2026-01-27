import BaseOrderManagement from './BaseOrderManagement';

const AllOrders = () => {
  return (
    <BaseOrderManagement 
      title="All Orders" 
      status="all" 
      apiEndpoint="/all" 
    />
  );
};

export default AllOrders;