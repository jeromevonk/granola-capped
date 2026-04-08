import * as React from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { alertService } from 'src/services';

export { CustomAlert };

CustomAlert.propTypes = {
  id: PropTypes.string,
};


function CustomAlert({ id }) {
  const router = useRouter();
  const [alert, setAlert] = React.useState(null);
  const [open, setOpen] = React.useState(true);

  const clearEmptyAlert = () => {
    setAlert(current => {
      // preserve alert across a single route change if flagged, then drop the flag
      if (current?.keepAfterRouteChange) {
        delete current.keepAfterRouteChange;
        return current;
      }
      return null;
    });
  }

  React.useEffect(() => {
    // subscribe to new alert notifications
    const subscription = alertService.onAlert(id)
      .subscribe(next => {
        if (!next.message) {
          clearEmptyAlert();
        } else {
          // replace with the latest alert so a new action always supersedes a stale one
          setAlert(next);
          setOpen(true);
        }
      });

    // clear alerts on location change. Deferred via setTimeout so the clear
    // runs after the new route's components have mounted and subscribed —
    // otherwise alerts emitted during navigation (e.g. keepAfterRouteChange)
    // would be cleared before the new page can receive them.
    const clearAlerts = () => {
      setTimeout(() => alertService.clear(id));
    };
    router.events.on('routeChangeStart', clearAlerts);

    // clean up function that runs when the component unmounts
    return () => {
      // unsubscribe to avoid memory leaks
      subscription.unsubscribe();
      router.events.off('routeChangeStart', clearAlerts);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!alert) return null;

  const handleClose = (_event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    setAlert(null);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={850}
      onClose={handleClose}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      <Alert
        onClose={handleClose}
        severity={alert.type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  );
}