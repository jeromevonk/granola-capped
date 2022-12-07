import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SearchBar from '../components/SearchBar';
import { useRouter } from 'next/router'

export default function SearchMobile() {

  const router = useRouter();

  function handleSearch(event) {
    // If user hits enter, perform the search
    if (event.key == 'Enter' && event.target.value.trim() != '') {
      router.push({
        pathname: '/search',
        query: { query: event.target.value },
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="body1" component="h1" sx={{ mt: 4 }}>
        Search for anything inside description or details
      </Typography>
      <Box sx = {{marginTop: 5}}>
        <SearchBar 
          handleSearch={handleSearch}
        />
      </Box>
    </Container>
  );
}