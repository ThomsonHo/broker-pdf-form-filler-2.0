import React from 'react';
import Link from 'next/link';

const Drawer: React.FC = () => {
  return (
    <div className="drawer">
      <ul>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/profile">Profile</Link></li>
        <li><Link href="/settings">Settings</Link></li>
        {/* Add other user-accessible links here */}
      </ul>
    </div>
  );
};

export default Drawer; 