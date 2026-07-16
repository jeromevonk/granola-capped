import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Desktop-only helper: documents the keyboard shortcuts that already
// exist on the Expenses page. Opened with '?' or via the user menu.
const sections = [
  {
    title: 'Navigation',
    items: [
      [['←', '→'], 'Previous / next month'],
      [['h'], 'First page'],
      [['j'], 'Previous page'],
      [['k'], 'Next page'],
      [['l'], 'Last page'],
    ],
  },
  {
    title: 'Sorting',
    items: [
      [['t'], 'Toggle ascending / descending'],
      [['d'], 'Sort by date'],
      [['s'], 'Sort by amount spent'],
    ],
  },
  {
    title: 'With one expense selected',
    items: [
      [['e'], 'Edit'],
      [['2'], 'Duplicate'],
    ],
  },
];

function Kbd({ children }) {
  return (
    <Box
      component="kbd"
      sx={{
        px: 0.9,
        py: 0.2,
        mr: 0.5,
        border: '1px solid',
        borderColor: 'divider',
        borderBottomWidth: 2,
        borderRadius: 1,
        bgcolor: 'action.hover',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        lineHeight: 1.6,
        display: 'inline-block',
        minWidth: '1.6em',
        textAlign: 'center',
      }}
    >
      {children}
    </Box>
  );
}

Kbd.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function KeyboardShortcutsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Keyboard shortcuts</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Available on the Expenses page. Press <Kbd>?</Kbd> anytime to open this list.
        </Typography>
        <Stack spacing={2}>
          {sections.map((section) => (
            <Box key={section.title}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {section.title}
              </Typography>
              {section.items.map(([keys, description]) => (
                <Stack key={description} direction="row" alignItems="center" sx={{ py: 0.3 }}>
                  <Box sx={{ width: 90, flexShrink: 0 }}>
                    {keys.map((key) => <Kbd key={key}>{key}</Kbd>)}
                  </Box>
                  <Typography variant="body2">{description}</Typography>
                </Stack>
              ))}
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

KeyboardShortcutsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
