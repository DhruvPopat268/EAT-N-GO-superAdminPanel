import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Fade,
  useTheme
} from '@mui/material';
import { IconUserShield, IconKeyFilled, IconUser, IconSettings } from '@tabler/icons-react';
import PermissionsTab from './PermissionsTab';
import RolesTab from './RolesTab';
import UsersTab from './UsersTab';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function RBACManagement() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconUserShield size={32} color={theme.palette.primary.main} />
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              RBAC Management
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Manage permissions, roles, and user access control
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1000}>
        <Card 
          sx={{ 
            borderRadius: 0, 
            border: '1px solid #e0e0e0', 
            overflow: 'hidden',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                px: 3,
                '& .MuiTab-root': {
                  minHeight: 72,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  gap: 1
                }
              }}
            >
              <Tab 
                icon={<IconKeyFilled size={20} />} 
                label="Permissions" 
                iconPosition="start"
              />
              <Tab 
                icon={<IconSettings size={20} />} 
                label="Roles" 
                iconPosition="start"
              />
              <Tab 
                icon={<IconUser size={20} />} 
                label="Users" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            <TabPanel value={tabValue} index={0}>
              <PermissionsTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <RolesTab />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <UsersTab />
            </TabPanel>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}