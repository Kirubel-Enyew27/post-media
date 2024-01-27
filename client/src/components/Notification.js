import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

export default function Notification() {

  return (
    <div>
      <h2><FontAwesomeIcon icon={faBell} />Notifications</h2>
        <p>There is no notification yet!</p>
    </div>
  );
}

