// assets
import { IconCalendarEvent, IconSettings, IconTable, IconList } from '@tabler/icons-react';

// constant
const icons = {
    IconCalendarEvent,
    IconSettings,
    IconTable,
    IconList
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
        },
        {
            id: 'table-bookings',
            title: 'Bookings',
            type: 'item',
            icon: icons.IconList,
            url: '/table-booking/bookings'
        }
    ]
};

export default tableBooking;