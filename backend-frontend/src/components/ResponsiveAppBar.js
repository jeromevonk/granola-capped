import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SearchBar from '../components/SearchBar';
import KeyboardShortcutsDialog from '../components/KeyboardShortcutsDialog';
import { useRouter } from 'next/router'
import { useQueryClient } from '@tanstack/react-query';
import { userService } from 'src/services';
import { capitalizeFirstLetter } from 'src/helpers'
import { useKeydown } from 'src/hooks/use-keydown';
import { AppContext } from 'src/pages/_app';

const pages = [
  {
    title: 'New',
    url: '/new-expense'
  },
  {
    title: 'Categories',
    url: '/categories'
  },
  {
    title: 'Expenses',
    url: '/'
  },
  {
    title: 'Report',
    url: '/report',
    onlyLargeScreen: true
  },
  {
    title: 'Evolution',
    url: '/evolution'
  },
];

const settings = [
  {
    title: 'Logout',
  }
];

const ResponsiveAppBar = () => {
  // Context
  const context = React.useContext(AppContext);
  const [visibility, setVisibility] = context?.visibility || false;
  const {1: setSearchFocus} = context?.searchFocus || false;
  const [themeMode, toggleThemeMode] = context?.themeMode || ['light', () => {}];
  const queryClient = useQueryClient();

  // States
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  React.useEffect(() => {
    const subscription = userService.user.subscribe(x => setUser(x));
    return () => subscription.unsubscribe();
  }, []);

  // '?' opens the shortcuts overlay — unless the user is typing somewhere
  useKeydown((event) => {
    const el = event.target;
    const isTyping = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (event.key === '?' && !isTyping) {
      setShortcutsOpen(true);
    }
  });

  function logout() {
    // Drop all cached server data (it belongs to the logged-out user)
    queryClient.clear();

    // Logout
    userService.logout();
  }

  const router = useRouter();

  // only show app bar when logged in
  if (!user) return null;

  // ----------------------------------------------------------
  // toggleVisibility
  // toggle the visibility state
  // ----------------------------------------------------------
  const toggleVisibility = () => {
    setVisibility(prev => !prev)
  }

  // ----------------------------------------------------------
  // handleOpenNavMenu
  // when screen is mobile, user clicks on the menu button
  // and nav menu opens
  // ----------------------------------------------------------
  function handleOpenNavMenu(event) {
    setAnchorElNav(event.currentTarget);
  };

  // ----------------------------------------------------------
  // handleOpenUserMenu
  // when user clicks on the avatar and user menu opens
  // ----------------------------------------------------------
  function handleOpenUserMenu(event) {
    setAnchorElUser(event.currentTarget);
  };

  // ----------------------------------------------------------
  // handleCloseNavMenu
  // closes the nav menu, either when:
  // - nav menu was open, menu button was clicked to close it
  // - navmenu was open, and an inside item was clicked
  // ----------------------------------------------------------
  function handleCloseNavMenu() {
    setAnchorElNav(null);
  };

  // ----------------------------------------------------------
  // handleCloseUserMenu
  // closes the user menu, either when:
  // - user menu was open, avatar button was clicked to close it
  // - user menu was open, and an inside item was clicked
  // ----------------------------------------------------------
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // ----------------------------------------------------------
  // handleNavMenuClick
  // call handleCloseNavMenu and redirect to page
  // ----------------------------------------------------------
  const handleNavMenuClick = (page) => {
    handleCloseNavMenu();

    // Go to page
    router.push(page.url)
  }

  // ----------------------------------------------------------
  // handleUserMenuClick
  // call handleCloseUserMenu and logout
  // ----------------------------------------------------------
  const handleUserMenuClick = (setting) => {
    handleCloseUserMenu();

    // For now, there's only one action on the user menu
    if (setting.title === 'Logout') logout();
  }

  // ----------------------------------------------------------
  // handleSearch
  // handles the searchBar
  // ----------------------------------------------------------
  function handleSearch(event) {
    // If user hits enter, perform the search
    if (event.key == 'Enter' && event.target.value.trim() != '') {
      router.push({
        pathname: '/search',
        query: { query: event.target.value.trim() },
      });
    }
  };

  // Mobile variant: also collapse the expanded search field
  function handleMobileSearch(event) {
    handleSearch(event);
    if (event.key == 'Enter' && event.target.value.trim() != '') {
      setMobileSearchOpen(false);
    }
  };

  // ----------------------------------------------------------
  // Expanded mobile search: the field takes over the whole bar
  // ----------------------------------------------------------
  if (mobileSearchOpen) {
    return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              aria-label="close search"
              onClick={() => setMobileSearchOpen(false)}
              sx={{ color: '#ffffff', mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <SearchBar
                handleSearch={handleMobileSearch}
                setSearchFocus={setSearchFocus}
                autoFocus
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            onClick={() => router.push('/')}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              mr: 2,
              cursor: 'pointer',
            }}
          >
            <AttachMoneyOutlined sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              GRANOLA
            </Typography>
          </Box>

          {/* 
            // ----------------------------------------
            // Nav Menu
            // ----------------------------------------
            // Show only for xs - extra small devices
            // (portrait phones, less than 576px)
            // https://mui.com/system/display/
            // ----------------------------------------
            */
          }
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                !page.onlyLargeScreen &&
                <MenuItem key={page.title} onClick={() => handleNavMenuClick(page)}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            onClick={() => router.push('/')}
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              flexGrow: 1,
              mr: 1,
              cursor: 'pointer',
            }}
          >
            <AttachMoneyOutlined sx={{ mr: 0.5, fontSize: '1.2rem' }} />
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              GRANOLA
            </Typography>
          </Box>

          { /*
            // ----------------------------------------
            // Mobile search icon — expands over the bar
            // ----------------------------------------
            */
          }
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              aria-label="search"
              onClick={() => setMobileSearchOpen(true)}
              sx={{ color: '#ffffff' }}
            >
              <SearchIcon />
            </IconButton>
          </Box>

          {/* 
            // ----------------------------------------
            // Pages on the app bar
            // ----------------------------------------
            // Show for md (medium devices) and bigger
            // https://mui.com/system/display/
            // ----------------------------------------
            */
          }
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              !page.onlySmallScreen &&
              <Button
                key={page.title}
                onClick={() => handleNavMenuClick(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          { /* 
            // ----------------------------------------
            // Search fields
            // ----------------------------------------
            */
          }
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <SearchBar
              handleSearch={handleSearch}
              setSearchFocus={setSearchFocus}
            />
          </Box>

          { /* 
            // ----------------------------------------
            // Visibility
            // ----------------------------------------
            */
          }
          <Box>
            <IconButton aria-label="visible" onClick={toggleVisibility} sx={{ marginRight: 1 }}>
              {visibility ? <VisibilityOffIcon style={{ color: '#ffffff' }} /> : <VisibilityIcon style={{ color: '#ffffff' }} />}
            </IconButton>
          </Box>

          { /*
            // ----------------------------------------
            // Light/dark mode
            // On small screens this lives inside the
            // user menu to keep the app bar uncluttered
            // ----------------------------------------
            */
          }
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton aria-label="toggle light/dark mode" onClick={toggleThemeMode} sx={{ marginRight: 1 }}>
              {themeMode === 'dark' ? <Brightness7Icon style={{ color: '#ffffff' }} /> : <Brightness4Icon style={{ color: '#ffffff' }} />}
            </IconButton>
          </Box>

          { /* 
            // ----------------------------------------
            // User menu - always show
            // ----------------------------------------
            */
          }
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={capitalizeFirstLetter(user.username)}
                  src={`/avatar/${user.id}.jpg`}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <ListSubheader>{user.username}</ListSubheader>
              <Divider />
              {/* On small screens the theme toggle lives here */}
              <MenuItem
                onClick={toggleThemeMode}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <ListItemIcon>
                  {themeMode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                </ListItemIcon>
                <Typography textAlign="center">{themeMode === 'dark' ? 'Light mode' : 'Dark mode'}</Typography>
              </MenuItem>
              {/* Keyboard shortcuts only make sense with a keyboard */}
              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  setShortcutsOpen(true);
                }}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <ListItemIcon>
                  <KeyboardIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Keyboard shortcuts</Typography>
              </MenuItem>
              {settings.map((setting) => (
                <MenuItem key={setting.title} onClick={() => handleUserMenuClick(setting)}>
                  <Typography textAlign="center">{setting.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </AppBar>
  );
};

export default ResponsiveAppBar;