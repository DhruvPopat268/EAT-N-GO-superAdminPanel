// assets
import { IconWallet } from '@tabler/icons-react';

// constant
const icons = {
    IconWallet
};

// ==============================|| ADMIN WALLET MENU ITEMS ||============================== //

const adminWallet = {
    id: 'admin-wallet',
    title: 'Admin Wallet Management',
    icon: icons.IconWallet,
    type: 'group',
    children: [
        {
            id: 'wallet-transactions',
            title: 'Wallet Transactions',
            type: 'item',
            url: '/admin-wallet/transactions',
            icon: icons.IconWallet
        }
    ]
};

export default adminWallet;
