import React, { useState, useEffect } from 'react';
import { Grid, Paper, Table, TableBody, TableRow, TableContainer, TableCell, TextField, Checkbox } from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import './App.css';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    background: 'lightblue'
  },
  paper: {
    height: '400px',
    width: '400px',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  container: {
    height: '100vh',
    flexGrow: 1
  },
  tableContainer: {
    width: '100%',
    maxHeight: 365
  },
  errorContainer: {
    height: '200px',
    background: 'red',
  }
}));

let timeout;
let debounce = function (func, delay) {
  clearTimeout(timeout);

  timeout = setTimeout(func, delay);
};

function App() {
  const classes = useStyles();
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);
  const [filterError, setFilterError] = useState(false);
  const [name, setName] = useState([]);

  useEffect(() => {
    if (search === '') {
      fetchPlaces();
    }

    if (error === true) {
      fetchPlaces();
    }
  }, [search, error, filterError]);

  const fetchPlaces = async () => {
    try {
      const res = await axios.get(`http://localhost:3030/cities?limit=50`);
      setPlaces(res.data.data)
      setError(false);
    } catch (err) {
      setError(true);
    }
  }

  const onChangeHandler = (e) => {
    setSearch(e.target.value);
  }

  useEffect(() => {
    if (search !== '') {
      debounce(filterPlaces, 1000);
    }
    if (search !== '' && filterError === true) {
      debounce(filterPlaces, 1000);
    }

  }, [search, filterError]);

  const filterPlaces = async () => {
    try {
      const res = await axios.get(`http://localhost:3030/cities?filter=${search}&&limit=50`)
      setFiltered(res.data.data)
      setFilterError(false);
    } catch (error) {
      setFilterError(true);
    }
  }

  const updatePreference = async (e) => {
    let cityId = e.target.value

    if (name.includes(cityId)) {
      let filtered = name.filter((id) => id !== cityId);
      setName(filtered);
      try {
        await axios.patch(`http://localhost:3030/preferences/cities`, { [cityId]: false })
      } catch (error) {
        await axios.patch(`http://localhost:3030/preferences/cities`, { [cityId]: false })
      }
    } else {
      let data = name;
      data.push(e.target.value);
      setName(data);
      let cityId = e.target.value
      try {
        await axios.patch(`http://localhost:3030/preferences/cities`, { [cityId]: true })
      } catch (error) {
        await axios.patch(`http://localhost:3030/preferences/cities`, { [cityId]: true })
      }
    }
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={3} className={classes.container} justifyContent='center' alignItems='center'>
        {error && <Grid container item xs={12} s={6} className={classes.errorContainer} justifyContent='center' alignItems='center'>
          Trouble Fetching data.... Re-Fetching again!
        </Grid>}
        <Paper xs={12} className={classes.paper} elevation={3}>
          <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
              <AccountCircle />
            </Grid>
            <Grid item>
              <TextField value={search} onChange={onChangeHandler} label="Search Country" />
            </Grid>
          </Grid>
          <TableContainer className={classes.tableContainer}>
            <Table stickyHeader >
              <TableBody>
                {
                  filtered !== null ? filtered.map((place) => (
                    <TableRow key={place.geonameid}>
                      <TableCell>
                        <Checkbox
                          color='primary'
                          type='checkbox'
                          name='checkbox'
                          value={place.geonameid}
                          onChange={updatePreference}
                        />
                        {place.name}
                        <br />
                        <span style={{ marginLeft: '45px' }} />{place.subcountry} {' - '} {place.country}

                      </TableCell>
                    </TableRow>
                  )) : places.map((place) => (
                    <TableRow key={place.geonameid}>
                      <TableCell variant='head' align='left' >
                        <Checkbox
                          color='primary'
                          type='checkbox'
                          name='checkbox'
                          value={place.geonameid}
                          onChange={updatePreference}
                        />
                        {place.name}``
                        <br />
                        <span style={{ marginLeft: '45px' }} />{place.subcountry}{' - '}{place.country}
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </div>
  );
}

export default App;
