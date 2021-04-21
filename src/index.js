import React from 'react';
import ReactDOM from 'react-dom';


import App from './components/App';
import reportWebVitals from './reportWebVitals';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Spinner from './Spinner';
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'; 

import firebase from './firebase';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './reducers';
import { setUser, clearUser } from './actions';

const store = createStore(rootReducer, composeWithDevTools())

class Root extends React.Component{

  componentDidMount(){
    console.log(this.props.isLoading);
    firebase.auth().onAuthStateChanged(user =>{
      if(user){
        console.log(user);
        this.props.setUser(user);
        this.props.history.push('/');
      }
      else{
        this.props.history.push('/login');
        this.props.clearUser();
      }
    })
  }
  

  render(){
    return this.props.isLoading ? <Spinner /> : (
      
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
          </Switch>
    );
  }
}


const mapStateFromProp = state =>  ({
  isLoading : state.user.isLoading
})

const RootwithAuth = withRouter(connect(mapStateFromProp, {setUser,clearUser})(Root))

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
    <Router>
      <RootwithAuth /> 
    </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
