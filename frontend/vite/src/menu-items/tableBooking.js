// assets
import { IconCalendarEvent, IconSettings, IconTable } from '@tabler/icons-react';

// constant
const icons = {
    IconCalendarEvent,
    IconSettings,
    IconTable
};

// ==============================|| TABLE BOOKING MENU ITEMS ||============================== //

const tableBooking = {
    id: 'table-booking',
    icon: icons.IconCalendarEvent,
    title: 'Table Booking Management',
    type: 'group',
    children: [
        {
            id: 'table-booking-config',
            title: 'Configuration',
            type: 'item',
            icon: icons.IconSettings,
            url: '/table-booking/configuration'
        }
    ]
};

export default tableBooking;