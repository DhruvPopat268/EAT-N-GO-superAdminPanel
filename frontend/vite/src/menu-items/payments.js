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
    title: 'Payments Management',
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
                },
                {
                    id: 'refunds',
                    title: 'Refunds',
                    type: 'item',
                    url: '/payments/refunds',
                },
                {
                    id: 'order-payment-history',
                    title: 'Order Payment History',
                    type: 'item',
                    url: '/payments/order-payment-history',
                },
                {
                    id: 'transaction-history',
                    title: 'Transaction History',
                    type: 'item',
                    url: '/payments/transaction-history',
                },
                {
                    id: 'upi-management',
                    title: 'UPI Management',
                    type: 'item',
                    url: '/payments/upi-management',
                }
            ]
        }
    ]
};

export default payments;