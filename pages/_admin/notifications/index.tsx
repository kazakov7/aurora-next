import React from 'react';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import MyProfileNotifications from '../../../libs/components/mypage/MyProfileNotifications';

const AdminNotificationsPage = () => <section className="admin-notifications"><MyProfileNotifications /></section>;

export default withAdminLayout(AdminNotificationsPage);
