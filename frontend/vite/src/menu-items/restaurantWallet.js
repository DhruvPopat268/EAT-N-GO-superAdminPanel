// assets
import { IconWallet } from '@tabler/icons-react';

// constant
const icons = {
    IconWallet
};

// ==============================|| RESTAURANT WALLET MENU ITEMS ||============================== //

const restaurantWallet = {
    id: 'restaurant-wallet',
    title: 'Restaurant Wallet Management',
    icon: icons.IconWallet,
    type: 'group',
    children: [
        {
            id: 'restaurant-wallet-transactions',
            title: 'Wallet Transactions',
            type: 'item',
            url: '/restaurant-wallet/transactions',
            icon: icons.IconWallet
        }
    ]
};

export default restaurantWallet;
