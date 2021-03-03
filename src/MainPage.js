import React from 'react';
import { Redirect, Route, Switch, HashRouter as Router } from "react-router-dom"
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import MenuIcon from '@material-ui/icons/Menu';
import StopIcon from '@material-ui/icons/Stop';
import AssistantIcon from '@material-ui/icons/Assistant';
import ExposurePlus1Icon from '@material-ui/icons/ExposurePlus1';
import InfoIcon from '@material-ui/icons/Info';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';

import Main from './pages/Main'
import Stone from './pages/Stone'
import Reinforce from './pages/Reinforce'
import Enchant from './pages/Enchant'
import UserInfo from './pages/UserInfo'
import NotFoundPage from './pages/NotFoundPage'
import GrowthMain from './pages/growth/GrowthMain'

//const { ipcRenderer } = require('electron')

const drawerWidth = 2400;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - 0px)`,
      marginLeft: 0,
    },
  },
  list: {
    width: 0,
  },
  fullList: {
    width: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
}));

const { ipcRenderer } = window;

/*
var calcinfo = {
  tier: 3,
  subtier: 2,
  current: [
    6,
    6,
    6,
    6,
    6,
    6
  ],
  target: [
    9,
    9,
    9,
    9,
    9,
    9
  ],
  option: {
    breath: [false, false, false],
    book: false,
    wisdom: false
  }
};

console.log(calcinfo);

ipcRenderer.send('char_search', '아슈에퀘스');
ipcRenderer.send('reinforce_calc', calcinfo);
*/

ipcRenderer.send('conn_check', 'test');

export default function TemporaryDrawer(props) {
  //const { window } = props;

  const classes = useStyles();
  const [state, setState] = React.useState({
    maindrawer: false,
    loaded: false
  });

  ipcRenderer.on('conn_response', (event, arg) => {
    setState({loaded: true, maindrawer: state.maindrawer})
  });

  ipcRenderer.on('char_search_response', (event, arg) => {
    console.log(arg);
  });

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ maindrawer: open, loaded: state.loaded });
  };

  if (!state.loaded) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const onDrawerClicked = (target) => {
    document.location = "#/" + target;
    console.log(document.location.href);
  }

  const list = () => (
    <div
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button key="calc-main" component="a" onClick={(event) => onDrawerClicked("")}>
          <ListItemIcon><HomeIcon/></ListItemIcon>
          <ListItemText primary="메인" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key="char-search" component="a" onClick={(event) => onDrawerClicked("search")}>
          <ListItemIcon><SearchIcon/></ListItemIcon>
          <ListItemText primary="캐릭터 조회" />
        </ListItem>
        <ListItem button key="help-growth" component="a" onClick={(event) => onDrawerClicked("growth")}>
          <ListItemIcon><InfoIcon/></ListItemIcon>
          <ListItemText primary="내실" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key="calc-abi" component="a" onClick={(event) => onDrawerClicked("stone")}>
          <ListItemIcon><StopIcon/></ListItemIcon>
          <ListItemText primary="돌파고" />
        </ListItem>
        <ListItem button key="calc-rein" component="a" onClick={(event) => onDrawerClicked("reinforce")}>
          <ListItemIcon><ExposurePlus1Icon/></ListItemIcon>
          <ListItemText primary="재련계산" />
        </ListItem>
        <ListItem button key="calc-enchant" component="a" onClick={(event) => onDrawerClicked("enchant")}>
          <ListItemIcon><AssistantIcon/></ListItemIcon>
          <ListItemText primary="각인계산" />
        </ListItem>
      </List>
    </div>
  );
  return (
    <div>
      {/*<React.Fragment key="maindrawer">*/}
        <Drawer 
            className={classes.drawer}
            anchor="left"
            open={state["maindrawer"]}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
      {/*</React.Fragment>*/}
      <div className={classes.root}>
        <CssBaseline />
        <AppBar  className={classes.appBar}
          position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer(true)}
              edge="start"
              className={clsx(classes.menuButton, state["maindrawer"] && classes.hide)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              <Link to="#main" color="inherit">LOSTARK Utility</Link>
            </Typography>
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Router>
            <Switch>
              <Route exact path="/" component={Main}/>
              <Route exact path="/reinforce" component={Reinforce}/>
              <Route exact path="/stone" component={Stone}/>
              <Route exact path="/enchant" component={Enchant}/>
              <Route exact path="/growth" component={GrowthMain}/>
              <Route exact path="/user/:name" component={UserInfo}/>
              <Route exact path='/error/:err_code' component={NotFoundPage} />
              <Route>
                <Redirect to='/error/NOT_FOUND_PAGE'/>
              </Route>
            </Switch>
          </Router>
        </main>
      </div>
    </div>
  );
}