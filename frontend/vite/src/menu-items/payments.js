// assets
import { IconCreditCard, IconWallet } from '@tabler/icons-react';

// constant
const icons = {
    IconCreditCard,
    IconWallet
};

// ==============================|| PAYMENT MENU ITEMS ||============================== //

const payments = {
    id: 'payments',
    icon: icons.IconCreditCard,
    type: 'group',
    children: [
        {
            id: 'payment-management',
            title: 'Payment Management',
            type: 'collapse',
            icon: icons.IconWallet,
            children: [
                {
                    id: 'withdrawal-requests',
                    title: 'Withdrawal Requests',
                    type: 'item',
                    url: '/payments/withdrawal-requests',
                },
                {
                    id: 'approved-withdrawals',
                    title: 'Approved Withdrawals',
                    type: 'item',
                    url: '/payments/approved-withdrawals',
                },
                {
                    id: 'rejected-withdrawals',
                    title: 'Rejected Withdrawals',
                    type: 'item',
                    url: '/payments/rejected-withdrawals',
                }
            ]
        }
    ]
};

export default payments;