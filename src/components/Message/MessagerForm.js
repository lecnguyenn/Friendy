import React from 'react'; 
import { v4 as uuidv4 } from 'uuid';
import {Segment, Button, Input} from 'semantic-ui-react';
import firebase from '../../firebase';

import FileModal from './FileModal';
import ProgressBar from './ProgressBar';
import {Picker, emojiIndex} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
// import { unstable_renderSubtreeIntoContainer } from 'react-dom';
class MessageForm extends React.Component{
    state ={
        storageRef: firebase.storage().ref(),
        typingRef:firebase.database().ref('typing'),
        uploadState:'',
        uploadTask:null,
        message: '',
        percentUpload: 0,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors:[],
        modal: false,
        emojiPicker: false
    }


    componentWillUnmount(){
        if(this.state.uploadTask !== null){
            this.state.uploadTask.cancel();
            this.setState({uploadTask:null});
        }
    }
     openModal = () => this.setState({
            modal:true
        });
     closeModal = () => this.setState({modal: false});
 
    handleChange = event =>{
        this.setState({[event.target.name] : event.target.value});
    }

    handleKeyDown = () =>{
        const { message, typingRef, channel, user } = this.state;

        if(message){
            typingRef
            .child(channel.id)
            .child(user.uid)
            .set(user.displayName)
        }
        else{
            typingRef
            .child(channel.id)
            .child(user.uid)
            .remove();
        }
    }

    handleTogglePicker =() =>{
        this.setState({emojiPicker: !this.state.emojiPicker});
    }


    handleAddEmoji = emoji =>{
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage}${emoji.colons}`);
        this.setState({message: newMessage, emojiPicker:false});
        setTimeout(()=>this.messageInputRef.focus(),0)
    }



    colonToUnicode = message =>{
        return message.replace(/:[A-Za-z0-9_+-]+:/g,x =>{
            x= x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if(typeof emoji !== "undefined"){
                let unicode = emoji.native;
                if(typeof unicode !== "undefined"){
                    return unicode;
                }
            }
            x=":" + x + ":";
            return x;
        });
     
    }

    createMessage = (fileURL = null) =>{
        const message = {
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        user: {
            id: this.state.user.uid,
            name: this.state.user.displayName,
            avatar: this.state.user.photoURL

        },
        };
        if(fileURL !== null){
            message['image'] = fileURL;
        }
        else{
            message['content'] = this.state.message;
        }
    
        return message;
    }
    sendMessage = () =>{
        const { getMessagesRef} = this.props;
        const { message, channel, typingRef, user } = this.state;

        if(message) {
            // send message 
            this.setState({loading :true});
            getMessagesRef()
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({loading:false, message:'', errors:[]})
                typingRef
                     .child(channel.id)
                     .child(user.uid)
                     .remove();
            })
            .catch(err =>{
                console.log(err);
                this.setState({
                    loading: false,
                    errors: this.state.errors.concat(err)
                })
            })
        }
        else{
            this.setState({
                errors: this.state.errors.concat({message:' Add a message'})
            });
        }
    };

    getPath = () =>{
        if(this.props.isPrivateChannel){
            return `chat/private/${this.state.channel.id}`;
        } else{
            return 'chat/public';
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;


        this.setState({
            uploadState:'uploading',
            uploadTask:this.state.storageRef.child(filePath).put(file,metadata)
        },
        ()=>{
            this.state.uploadTask.on('state_changed',snap =>{
                const percentUpload = Math.round((snap.bytesTransferred / snap.totalBytes)*100);
                this.props.isProgressBarVisible(percentUpload);
                this.setState({percentUpload});
            },
            err =>{
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState:'errors',
                    uploadTask:null
                })
            },
            () =>{
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL =>{
                    this.sendFileMessage(downloadURL, ref, pathToUpload);
                })
                .catch(err =>{
                    console.log(err);
                    this.setState({
                        errors:this.state.errors.concat(err),
                        uploadState:'errors',
                        uploadTask:null
                    })
                })
            }   
            
            );
            
        }
        
        )
    };

    sendFileMessage = (fileURL, ref, pathToUpload)=>{
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileURL))
            .then(() =>{
                this.setState({uploadState: 'done'})
            })
            .catch(err =>{
                console.error(err);
                this.setState({
                    errors:this.state.errors.concat(err)
                })
            })
    }


    render(){
        
        const {  errors, message, loading, modal, uploadState, percentUpload, emojiPicker } = this.state;

        return (
            <Segment className="message_form">
                {emojiPicker && (
                    <Picker
                    set="apple"
                    onSelect={this.handleAddEmoji}
                    className="emojiPicker"
                    title="Pick your emoji"
                    emoji="point_up"
                    />
                )}
                <Input 
                    fluid
                    name="message"
                    onChange={this.handleChange}
                    onKeyDown= {this.handleKeyDown}
                    value={message}
                    ref={node => ( this.messageInputRef = node)}
                    style={{ marginBottom: '0.7em'}}
                    label={
                    <Button 
                    icon={emojiPicker ? 'close' : 'add'}
                    content={emojiPicker ? "Close" : null}
                    onClick={this.handleTogglePicker}
                    
                     
                     />}
                    labelPosition="left"
                    className={
                        errors.some(error => error.message.includes('message'))? 'error' : ''
                    }
                    placeholder="write your message"
                />
               
                <Button.Group icon widths="2">
                    
                    <Button  
                    onClick ={this.sendMessage}
                    style={{backgroundColor:"#FBBC05"}}
                    disabled={loading}
                    // color="#FBBC05"
                    content="Add Reply"
                    labelPosition="left"
                    icon="edit" 
                    />

                    <Button 
                    style={{backgroundColor:"#34A853"}}
                    disabled={uploadState === 'uploading'}
                    onClick={this.openModal}
                    content="upload Media"
                    labelPosition="right"
                    icon="cloud upload"
                    />


                    
                </Button.Group>
                <FileModal 
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar  
                uploadState={uploadState}
                percentUpload={percentUpload}/>
            </Segment>
        );
    }
}
export default MessageForm;