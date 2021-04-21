import React from 'react';
import firebase from '../../firebase';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import AvartarEditor from 'react-avatar-editor';

class UserPanel extends React.Component{


    state = { 
        user : this.props.currentUser,
        modal: false,
        previewImage:'',
        croppedImage:'',
        uploadCroppedImage:'',
        blob:'',
        strorageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef:firebase.database().ref('users'),
        metadata:{
            contenType:'image/jpeg'
        }
    }

    openModel = () => this.setState({modal: true});

    closeModal = () => this.setState({modal:false});
   

    dropdownOptions = () =>[{
        key: "user",
        text: <span>Sign in as <strong>{ this.state.user.displayName}</strong></span>,
        disable: true
    },
    {
        key:"avatar",
        text: <span onClick={this.openModel}>Change Avatar</span>
    },
    {
        key:"signout",
        text: <span onClick ={this.handleSignout}>Sign out</span>
    }

];
    uploadCroppedImage = () =>{

        const { strorageRef, userRef, blob, metadata } = this.state;
        strorageRef
        .child(`avatar/users/${userRef.uid}`)
        .put(blob, metadata)
        .then(snap =>{
            snap.ref.getDownloadURL().then(downloadURL =>{
                this.setState({uploadCroppedImage: downloadURL}, () =>
                this.changeAvatar() )
            })
        })
    }

    changeAvatar = () => {
        this.state.userRef 
        .updateProfile({
            photoURL:this.state.uploadCroppedImage
        })
        .then(()=>{
            console.log('PhotoURL updated');
            this.closeModal();
        })
        .catch(err=>{
            console.error(err);
        })

        this.state.usersRef
        .child(this.state.user.uid)
        .update({avatar:this.state.uploadCroppedImage})
        .then(() =>{
            console.log('User avatar updated');
        })
        .catch(err =>{
            console.error(err);
        })
    }
    handleChange = event =>{
        const file = event.target.files[0];
        const reader = new FileReader();

        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load', () =>{
                this.setState({previewImage: reader.result});
            })
        }
    }
    
    handleCropImage = () =>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob =>{
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage:imageUrl,
                    blob
                })
            })
        }
    }
    
    handleSignout = () =>{
        firebase
        .auth()
        .signOut()
        .then(() => console.log("signed out!"));
    }



    render(){
        const { user, modal, previewImage, croppedImage } = this.state;
        const {primaryColor} = this.props
        return(
            <Grid style={{bachground: primaryColor }}>
                <Grid.Column>
                    
                    <Grid.Row  style={{ padding: "1.2em", margin:0 }}>
                        <Header inverted  floated="left" as="h2"> 
                            <Icon name="street view" />

                            <Header.Content>
                                Friendy 
                            </Header.Content>
                        </Header>

                    <Header style={{ padding:'0.25em'}} as="h4" inverted>
                            <Dropdown 
                            trigger={
                                <span>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {user.displayName}
                                </span>
                            }
                            options={this.dropdownOptions()}
                                />
                    </Header>
             </Grid.Row>

             {/* Change User Avatar Modal */}
             <Modal basic open={modal} onClose={this.closeModal}>
                 <Modal.Header>Change Avatar</Modal.Header>
                 <Modal.Content>
                     <Input onChange={this.handleChange}
                     fluid
                     type="file"
                     label="New Avatar"
                     name="previewImage"
                     />
                     <Grid centered stackable columns={2}>
                            <Grid.Row centered>
                                <Grid.Column className="ui center aligned grid">
                                    {previewImage && (
                                        <AvartarEditor 
                                        ref ={node =>(this.avatarEditor = node)}
                                        image={previewImage}
                                        width={210}
                                        height={120}
                                        border={50}
                                        scale={1.2}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column>
                                   {croppedImage && (
                                       <Image
                                       style={{margin: '3.5em auto'}}
                                       width={100}
                                       height={100}
                                    
                                       src={croppedImage}
                                       />
                                   )}
                                </Grid.Column>
                            </Grid.Row>
                     </Grid>
                 </Modal.Content>
                 <Modal.Actions>
                    {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                         <Icon  name="save"/> change avatar
                     </Button>}
                     <Button color="green" inverted onClick={this.handleCropImage}>
                         <Icon name="image" /> Preview
                     </Button>
                     <Button color="red" inverted onClick={this.closeModal}>
                         <Icon name="remove" /> Cancle
                     </Button>
                 </Modal.Actions>
             </Modal>

                </Grid.Column>

            </Grid>
        )
    }
}




export default UserPanel;