import React from 'react';
import {Sidebar, Menu, Divider, Button, Modal, Label, Icon, Segment} from 'semantic-ui-react';import{ connect} from 'react-redux';
import { setColors } from '../../actions';
import firebase from '../../firebase';
import { SliderPicker} from 'react-color';


class ColorPanel extends React.Component {
    state={
        modal:false,
        primary:'',
        secondary:'',
        user:this.props.currentUser,
        userRef: firebase.database().ref('users'),
        userColors:[]

    }

    componentDidMount() {
        if(this.state.user){
            this.addListenner(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListener();
    }


    removeListener = () =>{
        this.state.userRef.child(`${this.state.user.uid}/colors`).off();
    }
    addListenner = userId =>{
        let userColors= [];
        this.state.userRef
            .child(`${userId}/colors`)
            .on('child_added', snap =>{
                userColors.unshift(snap.val());
                console.log(userColors);
                this.setState({ userColors})
            });
    };

    handleChangePrimary = color => this.setState({ primary : color.hex});


    handleChangeSecondary = color => this.setState({ secondary: color.hex});
    handleSaveColor = () =>{
        if(this.state.secondary && this.state.primary){
            this.saveColor(this.state.primary, this.state.secondary);
        }
    }

    saveColor =(primary, secondary) =>{
        this.state.userRef
        .child(`${this.state.user.uid}/colors`)
        .push()
        .update({
            primary,
            secondary
        })
        .then(() =>{
            console.log('Color added');
            this.closeModal();
        })
        .catch(err => console.error(err));
    }

    displayUserColors = colors => (
        colors.length > 0 && colors.map((color,i) => (
            <React.Fragment key={i} >
            <Divider />
            <div 
            className="color_container" 
            onClick={() => this.props.setColors(color.primary, color.secondary)}>
                    <div className="color_square" style={{ background: color.primary}}>

                    <div className="color_overlay" style={{ background: color.secondary}}></div>
                </div>
            </div>
            </React.Fragment>
        ))
    )
    openModal = () => this.setState({modal:true});

    closeModal = () => this.setState({modal:false});
    render(){

        const {modal, primary, secondary, userColors} = this.state;
        return (
            <Sidebar 
            as={Menu}
            icon="labeled"
            inverted
            vertical
            visible
            width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
                {this.displayUserColors(userColors)}

            {/* Color Picker Modal */}
                <Modal basic open={modal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                    <Segment inverted>
                        <Label content="Primary Color" />
                            <SliderPicker color={primary} onChange={this.handleChangePrimary} />
                    </Segment>

                    <Segment inverted>
                        <Label content="Secondary Color" />
                        <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                    </Segment>
                   
                    </Modal.Content>
                        <Modal.Actions>
                            <Button color="green" inverted onClick={this.handleSaveColor}>
                                <Icon name="checkmark" /> Save Colors
                            </Button>

                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="checkmark" /> Cancle
                            </Button>
                        </Modal.Actions>
                  
                </Modal>
            </Sidebar>
        )
    }
}
export default connect(null, {setColors})(ColorPanel);