import React from 'react';
import { Grid, Form, Button, Header, Message, Icon, Segment } from 'semantic-ui-react';
import { Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends React.Component {

    state = { 
         email:'',
         password:'',
         errors:[],
         loading: false

    }

    displayError = errors => errors.map((error, i) => <p key={i}>{error.message}</p> )

    handleChange = event =>{
        this.setState({[event.target.name] : event.target.value})
    } 


    handleSubmit = event =>{
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.setState({ errors: [], loading:true })
        firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(signedInUser =>{
                console.log(signedInUser);
            })
            .catch((err) =>{
                console.log(err);
                this.setState({errors: this.state.errors.concat(err), loading: false})
            })
        }
    }
    isFormValid = ({email, password}) => email && password;

    handleInputError = (errors, inputName) =>{
        return errors.some(error =>error.message.toLowerCase().includes(inputName)) ?"error" :""
    }
    render(){
        const {email, password, errors, loading} = this.state;

        return(
         
            <Grid textAlign = "center" verticalAlign = "middle" className ="app">
                <Grid.Column style={{ maxWidth : 450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="comments outline" color="violet" />
                        DevChat
                    </Header>
                    <Form onSubmit= {this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input
                            fluid
                            name="email"
                            icon="mail"
                            iconPosition="left"
                            placeholder="Address Email"
                            onChange={this.handleChange}
                            value={email}
                            className={this.handleInputError(errors,'email')}
                            type="text"    
                            />

                            <Form.Input 
                            fluid
                            name="password"
                            icon="lock"
                            iconPosition="left"
                            placeholder="Password"
                            onChange={this.handleChange}
                            value={password}
                            className={this.handleInputError(errors,'password')}
                            type="password"
                             />

                             <Button color="violet"disabled={loading} className={loading ?'loading' : ''} fluid size="large">Login</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayError(errors)}
                        </Message>
                    )}
                    <Message>Don't haven an account?<Link to="/register"> Register</Link></Message>
                </Grid.Column>
            </Grid>

        )
    }
}

export default Login;