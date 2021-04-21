import React from 'react';
import firebase from '../../firebase';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { setCurrentChannel, setPrivateChannel } from '../../actions' 
import {connect} from 'react-redux';

class Channels extends React.Component{
    state = {
        activeChannel: '',
        user: this.props.currentUser,
        channel:null,
        channels:[],
        channelName: "",
        channelDetails:"",
        channelsRef: firebase.database().ref('channels'),
        messagesRef : firebase.database().ref('messages'),
        typingRef:firebase.database().ref('typing'),
        notifications:[],
        modal: false,
        firstLoad : true
    };

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    addListeners = () =>{
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap =>{
            loadedChannels.push(snap.val());
            // console.log(loadedChannels);
            this.setState({ channels: loadedChannels},() => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        })
    }


    handleNotifications = ( channelId, currentChannelId, notifications, snap) =>{
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId );

        if(index  !== -1){
            if(channelId !== currentChannelId ){
                lastTotal = notifications[index].total;
            }

            if(snap.numChildren() - lastTotal >0){
                notifications[index].count = snap.numChildren() - lastTotal;
            }
            notifications.[index].lastKnowTotal = snap.numChildren();
                }else{
            notifications.push({
                id:channelId,
                total: snap.numChildren(),
                lastKnowTotal: snap.numChildren(),
                count:0
            });
        }

        this.setState({notifications});
    }


    addNotificationListener = channelId =>{
        this.state.messagesRef.child(channelId).on('value', snap =>{
            if(this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }


    
    removeListeners = () =>{
        this.state.channelsRef.off();
        this.state.channels.forEach(channel =>{
            this.state.messagesRef.child(channel.id).off();
        })
    }

    setFirstChannel = () =>{

        const firstChannel = this.state.channels[0];

        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({channel:firstChannel});
        }
        this.setState({firstLoad: false})
    }

    addChannel = () => {
        const {channelsRef, channelName, channelDetails, user} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key, 
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() =>{
                this.setState({ channelName:'', channelDetails:''});
                this.closeModal();
                console.log("channels added")
            })
            .catch((err) =>{
                console.error(err);
            })
    }

    handleSubmit = event =>{
        event.preventDefault();
        if(this.isFormValid(this.state)){
            console.log('channel added');
           this.addChannel();
        }
    }

    handleChange = event =>{
        this.setState({[event.target.name] : event.target.value});
    }

    setActiveChannel = channel =>{
        this.setState({ activeChannel: channel.id})
    }    

    changeChannel = channel =>{
        this.setActiveChannel(channel);
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove();
        this.clearNotification();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    };

    clearNotification = () =>{
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);

        if(index !== -1){
            let updateNotification = [...this.state.notifications];
            updateNotification[index].total = this.state.notifications[index].lastKnowTotal;
            updateNotification[index].count = 0;
            this.setState({notifications: updateNotification});
        }
    }

    getNotificationCount = channel =>{
        let count = 0;

        this.state.notifications.forEach(notification =>{
            if( notification.id === channel.id){
                count = notification.count;
            }
        });
        if(count > 0 ) return count;

    }
    
    displayChannels = channels => (
        channels.length > 0 && channels.map(channel =>(
            <Menu.Item
            key={channels.id}
            onClick ={() => this.changeChannel(channel)}
            name = {channel.name}
            style = {{ opcity: 0.7 }}
            active= { channel.id === this.state.activeChannel}
            >
                {this.getNotificationCount(channel) && (
                    <Label color="red">{this.getNotificationCount(channel)}</Label>
                )}
          # {channel.name}
            </Menu.Item>
        ))
    )


    isFormValid =({channelName, channelDetails}) => channelName && channelDetails;

    openModal =() => this.setState({modal:true});
    closeModal = () =>this.setState({modal:false});
    render(){

        const { channels, modal } = this.state;
        return(
            <React.Fragment>
            <Menu.Menu className="menu" style={{ paddingBottom: '2em'}}>
                <Menu.Item>
                    <span>
                        <Icon name="exchange" /> Channels
                    </span>
                ({channels.length}) <Icon name="add" onClick={this.openModal}/>
                </Menu.Item>
                {/* Channels */}
                {this.displayChannels(channels)}
            </Menu.Menu>

    {/* Add channels modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Add Channel</Modal.Header>
            <Modal.Content>

                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <Input fluid
                        label="Name of channel"
                        name="channelName"
                        onChange={this.handleChange} 
                        />
                    </Form.Field>

                    <Form.Field>
                        <Input fluid
                        label="About the channel"
                        name="channelDetails"
                        onChange={this.handleChange} 
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>

            <Modal.Actions>
                <Button color="green" inverted onClick={this.handleSubmit}>
                        <Icon name="checkmark"/> Add
                </Button>

                <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove" /> Cancle
                </Button>
            </Modal.Actions>
        </Modal>
        </React.Fragment>
        );
    }
}


export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);