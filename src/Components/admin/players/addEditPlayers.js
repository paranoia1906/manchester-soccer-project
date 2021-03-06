import React, { Component } from 'react';
import AdminLayout from '../../../Hoc/AdminLayout';

import { validate } from '../../ui/misc';
import FormField from '../../ui/form_fields';
import { firebaseDB, firebasePlayers, firebase } from '../../../firebase';

import Fileuploader from '../../ui/file_uploader';
import defaultPlayerImage from '../../../Resources/images/stock_player_image.jpg';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class AddEditPlayers extends Component {

    state = {
        deleteOpen: false,
        deleteText: '',
        playerId: '',
        formType: '',
        formError: false,
        formSuccess: '',
        defaultImg: '',
        formdata: {
            name: {
                element: 'input',
                value: '',
                config: {
                    label: 'Player Name',
                    name: 'name_input',
                    type: 'text'
                },
                validation: {
                    required: true
                },
                valid: false,
                validationMessage: '',
                showLabel: true
            },
            lastname: {
                element: 'input',
                value: '',
                config: {
                    label: 'Player Lastname',
                    name: 'lastname_input',
                    type: 'text'
                },
                validation: {
                    required: true
                },
                valid: false,
                validationMessage: '',
                showLabel: true
            },
            position: {
                element: 'select',
                value: '',
                config: {
                    label: 'Player Position',
                    name: 'select_position',
                    type: 'select',
                    options: [
                        { key: "Keeper", value: "Keeper" },
                        { key: "Defence", value: "Defence" },
                        { key: "Midfield", value: "Midfield" },
                        { key: "Striker", value: "Striker" }
                    ]
                },
                validation: {
                    required: true
                },
                valid: false,
                validationMessage: '',
                showLabel: true
            },
            number: {
                element: 'input',
                value: '',
                config: {
                    label: 'Player number',
                    name: 'number_input',
                    type: 'text'
                },
                validation: {
                    required: true
                },
                valid: false,
                validationMessage: '',
                showLabel: true
            },
            image: {
                element: 'image',
                value: '',
                validation: {
                    required: true
                },
                valid: false
            }
        }
    }



    updateForm(element, id, content = '') {
        const newFormdata = { ...this.state.formdata };
        const newElement = { ...newFormdata[id] };
        if (content === '') {
            newElement.value = element.currentTarget.value;
        } else {
            newElement.value = content;
        }


        let validData = validate(newElement);
        newElement.valid = validData[0];
        newElement.validationMessage = validData[1];

        newFormdata[id] = newElement;

        this.setState({
            formError: false,
            formdata: newFormdata
        })
    }

    submitForm(event) {
        event.preventDefault();

        let dataToSubmit = {};
        let formIsValid = true;

        for (let key in this.state.formdata) {
            dataToSubmit[key] = this.state.formdata[key].value;
            formIsValid = this.state.formdata[key].valid && formIsValid;
        }

        if (formIsValid) {
            if (this.state.formType === 'Edit player') {
                firebaseDB.ref(`players/${this.state.playerId}`).update(dataToSubmit).then(() => {
                    console.log(this.props);
                    this.props.history.push('/admin_players');
                }).catch(e => {
                    console.log(e);
                    this.setState({
                        formError: true
                    })

                });

            } else {
                firebasePlayers.push(dataToSubmit).then(() => {
                    this.props.history.push('/admin_players')
                }).catch(e => {
                    this.setState({
                        formError: true
                    })

                })
            }

        } else {
            this.setState({
                formError: true
            })
        }
    }

    updateFields = (player, playerId, formType, defaultImg) => {
        const newFormdata = { ...this.state.formdata }
        if (defaultImg === '') {
            defaultImg = defaultPlayerImage;
        }
        for (let key in newFormdata) {
            newFormdata[key].value = player[key];
            newFormdata[key].valid = true;
        }

        this.setState({
            playerId,
            defaultImg,
            formType,
            formdata: newFormdata
        })
    }

    componentDidMount() {
        const playerId = this.props.match.params.id;

        if (!playerId) {
            this.setState({
                formType: 'Add Player'
            })
        } else {
            firebaseDB.ref(`players/${playerId}`).once('value')
                .then((snapshot) => {
                    const playerData = snapshot.val();
                    firebase.storage().ref('/players/')
                        .child(playerData.image).getDownloadURL()
                        .then(url => {
                            this.updateFields(playerData, playerId, 'Edit player', url)
                        }).catch(e => {
                            this.updateFields(playerData, playerId, 'Edit player', '')
                        })
                })
        }
    }

    storeFilename(filename) {
        this.updateForm({}, 'image', filename)
    }

    resetImage() {
        const newFormdata = { ...this.state.formdata }
        newFormdata['image'].value = '';
        newFormdata['image'].valid = false;
        this.setState({
            defaultImg: '',
            formdata: newFormdata
        })
    }

    deletePlayer() {
        console.log(this.props);
        firebaseDB.ref(`players/${this.state.playerId}`).remove().then(() => {
            this.props.history.push('/admin_players');
        }).catch(e => {
            console.log(e);
        });
    }

    handleClickOpen = () => {
        this.setState({ deleteOpen: true });
    };

    handleTextField(e) {
        this.setState({ deleteText: e.target.value });
    }

    handleClose = (id) => {
        console.log(id);
        if (id === 'delete') {
            const inputVal = this.state.deleteText;
            if (inputVal === 'remove') {
                this.deletePlayer();
            }
        }
        this.setState({ open: false });
    };



    render() {
        return (
            <AdminLayout>
                <div className="editplayers_dialog_wrapper">
                    <h2>
                        {this.state.formType}
                    </h2>
                    <div>
                        <form onSubmit={(event) => this.submitForm(event)}>

                            <Fileuploader
                                dir="players"
                                tag={"Player Image"}
                                defaultImg={this.state.defaultImg}
                                defaultImgName={this.state.formdata.image.value}
                                resetImage={() => this.resetImage()}
                                filename={(filename) => this.storeFilename(filename)}

                            />

                            <FormField
                                id={'name'}
                                formdata={this.state.formdata.name}
                                change={(element) => this.updateForm(element, 'name')}
                            />

                            <FormField
                                id={'lastname'}
                                formdata={this.state.formdata.lastname}
                                change={(element) => this.updateForm(element, 'lastname')}
                            />

                            <FormField
                                id={'number'}
                                formdata={this.state.formdata.number}
                                change={(element) => this.updateForm(element, 'number')}
                            />

                            <FormField
                                id={'position'}
                                formdata={this.state.formdata.position}
                                change={(element) => this.updateForm(element, 'position')}
                            />

                            <div className="success_label">
                                {this.state.formSuccess}
                            </div>
                            {this.state.formError ?
                                <div className="error_label">
                                    Something is wrong
                                </div>
                                : ''
                            }

                            <div className="admin_submit">
                                <button onClick={(event) => this.submitForm(event)}>
                                    {this.state.formType}
                                </button>
                            </div>



                        </form>
                        {this.state.formType === "Edit player" ?

                            <div>
                                <div className="admin_delete">
                                    <button onClick={() => this.handleClickOpen()}>
                                        Delete player
                                </button>
                                </div>
                                <Dialog
                                    open={this.state.deleteOpen}
                                    onClose={this.handleClose}
                                    aria-labelledby="form-dialog-title"
                                >
                                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Type 'remove' To Delete Selected Player
                                    </DialogContentText>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="confirm"
                                            label="Type here"
                                            type="text"
                                            fullWidth
                                            onChange={(e) => this.handleTextField(e)}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.handleClose} color="primary">
                                            Cancel
                                    </Button>
                                        <Button onClick={() => this.handleClose("delete")} color="primary">
                                            Delete
                                    </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>

                            : null}
                    </div>

                </div>
            </AdminLayout>
        );
    }
}

export default AddEditPlayers;