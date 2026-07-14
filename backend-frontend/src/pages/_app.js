import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { getTheme } from '../theme';
import createEmotionCache from '../createEmotionCache';
import { useMediaQueryMatch } from 'src/hooks/use-media-query-match';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

import { userService, alertService } from 'src/services';
import { CustomAlert } from 'src/components/CustomAlert';

import ResponsiveAppBar from 'src/components/ResponsiveAppBar';

export const AppContext = React.createContext();

// Thresholds in pixels for detecting large screen
const WIDTH_TRESHOLD = 940;
const HEIGT_TRESHOLD = 900;

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const router = useRouter();

  // ----------------------------------------------------------------
  // Server-state cache. Lives above the router, so data survives page
  // navigation. Mutations invalidate explicitly; the 5-min staleTime +
  // refetchOnWindowFocus cover the same user writing from another
  // device (e.g. desktop -> phone): returning to the tab shows cached
  // data instantly and revalidates in the background.
  // Query errors are handled once, globally, instead of per page.
  // ----------------------------------------------------------------
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 60 * 60 * 1000, // keep inactive data for 1h (e.g. other years)
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
    queryCache: new QueryCache({
      onError: (err) => alertService.error(`API error: ${err.message}`),
    }),
  }));

  // authorized does not mean authenticated - it means authorized for the current page
  const [authorized, setAuthorized] = useState(false);
  const [visibility, setVisibility] = useState(true);
  const [searchFocus, setSearchFocus] = useState(false);

  // ----------------------------------------
  // Screen size, subscribed via matchMedia
  // ----------------------------------------
  const largeScreenWidth = useMediaQueryMatch(`(min-width: ${WIDTH_TRESHOLD}px)`);
  const largeScreenHeight = useMediaQueryMatch(`(min-height: ${HEIGT_TRESHOLD}px)`);
  const largeScreen = useMemo(
    () => ({ width: largeScreenWidth, height: largeScreenHeight }),
    [largeScreenWidth, largeScreenHeight]
  );

  // ----------------------------------------
  // Light/dark mode: stored preference wins,
  // otherwise follow the system setting.
  // Starts as 'light' to match the prerendered
  // HTML and switches right after hydration.
  // ----------------------------------------
  const [themeMode, setThemeMode] = useState('light');

  React.useEffect(() => {
    const stored = localStorage.getItem('themeMode');
    const preferred = (stored === 'dark' || stored === 'light')
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (preferred !== 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with stored/system preference after hydration
      setThemeMode(preferred);
    }
  }, []);

  const toggleThemeMode = React.useCallback(() => {
    setThemeMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  }, []);

  const muiTheme = useMemo(() => getTheme(themeMode), [themeMode]);

  // ----------------------------------------------------------------
  // Auth check: redirect to login when accessing a private page
  // while not logged in (defined before the effect that wires it up)
  // ----------------------------------------------------------------
  function authCheck(url) {
    const publicPaths = ['/account/login', '/account/register'];
    const path = url.split('?')[0];
    if (!userService.userValue && !publicPaths.includes(path)) {
      setAuthorized(false);
      router.push({
        pathname: '/account/login',
      });
    } else {
      setAuthorized(true);
    }
  }

  // ----------------------------------------
  // Set callbacks for router events
  // ----------------------------------------
  React.useEffect(() => {
    // on initial load - run auth check
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time auth sync with localStorage after hydration
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false  
    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);

    // on route change complete - run auth check 
    router.events.on('routeChangeComplete', authCheck)

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI-only global state — server data lives in the query cache
  const memoized = useMemo(() => ({
    largeScreen,
    visibility: [
      visibility,
      setVisibility
    ],
    searchFocus: [
      searchFocus,
      setSearchFocus
    ],
    themeMode: [
      themeMode,
      toggleThemeMode
    ]
  }), [largeScreen, visibility, searchFocus, themeMode, toggleThemeMode]);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Granola</title>
      </Head>
      <ThemeProvider theme={muiTheme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AppContext.Provider value={memoized}>
            <div className={roboto.className}>
              <ResponsiveAppBar />
              <CustomAlert />
              {authorized &&
                <Component {...pageProps} />
              }
            </div>
          </AppContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};