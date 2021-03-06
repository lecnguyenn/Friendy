import React from 'react';
import { Menu , Icon, } from 'semantic-ui-react';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import {setCurrentChannel, setPrivateChannel} from '../../actions';



class Starred extends React.Component{
    state={
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        starredChannels: [],
        activeChannel:''
    }

    componentDidMount(){
        if(this.state.user){
        this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners =() =>{
        this.state.userRef.child(`${this.state.uid}/starred`).off();
    }

    addListeners = (userId) =>{
        this.state.userRef
        .child(userId)
        .child('starred')
        .on('child_added', snap =>{
            const starredChannel = {id: snap.key, ...snap.val()};
            this.setState({
                starredChannels: [...this.state.starredChannels, starredChannel]
            });
        });
        this.state.userRef
        .child(userId)
        .child('starred')
        .on('child_removed', snap =>{
            const channelToRemove = {id : snap.key, ...snap.val()};
            const filteredChannels = this.state.starredChannels.filter(channel =>{
                return channel.id !== channelToRemove.id;
            });
            this.setState({ starredChannels: filteredChannels});
        })

    }

    setActiveChannel = channel =>{
        this.setState({ activeChannel: channel.id})
    };



    changeChannel = channel =>{
        this.setActiveChannel(channel);
       
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    };  



    displayChannels = starredChannels => (
        starredChannels.length > 0 && starredChannels.map(channel =>(
            <Menu.Item
            key={channel.id}
            onClick ={() => this.changeChannel(channel)}
            name = {channel.name}
            style = {{ opcity: 0.7 }}
            active= { channel.id === this.state.activeChannel}
            >
     
          # {channel.name}
            </Menu.Item>
        ))
    )
    render(){

        const {starredChannels} = this.state;
        return(
           <Menu.Menu className="menu">
               <Menu.Item>
                   <span>
                       <Icon name="star" /> Starred
                   </span> {" "}
                   ({starredChannels.length})
               </Menu.Item>
               {this.displayChannels(starredChannels)}
           </Menu.Menu> 
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred)