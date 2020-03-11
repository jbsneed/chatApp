import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const firebase = require('firebase');

export default class CustomActions extends React.Component {

    constructor() {
        super()
    }

    //requests permission to camera roll and allows access to images from library
    pickImage = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

            if (status === 'granted') {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));

                if (!result.cancelled) {
                    const imageUrl = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrl })
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    //requests permission to camera and camera roll and store photo as state and return uri string
    takePhoto = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)

            if (status === 'granted') {

                let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                }).catch(error => console.log(error));

                if (!result.cancelled) {
                    const imageUrlLink = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrlLink });
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    //uploads image as blob to cloud storage
    uploadImage = async (uri) => {
        try {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = (() => {
                    resolve(xhr.response);
                });
                xhr.onerror = ((e) => {
                    console.log(e);
                    reject(new TypeError('Network Request Failed'));
                });
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });
            const getImageName = uri.split('/');
            const imageArrayLength = getImageName[getImageName.length - 1]
            const ref = firebase.storage().ref().child('images/' + imageArrayLength);
            console.log(ref, getImageName[imageArrayLength]);
            const snapshot = await ref.put(blob);

            blob.close();

            const imageURL = await snapshot.ref.getDownloadURL();
            return imageURL;
        } catch (error) {
            console.log(error)
        }
    }
    //requests permission fro location
    getLocation = async () => {
        try {
            const { status } = await Permissions.askAsync(Permissions.LOCATION);

            if (status === 'granted') {

                const result = await Location.getCurrentPositionAsync({})
                    .catch(error => console.log(error));
                const longitude = JSON.stringify(result.coords.longitude);
                const latitude = JSON.stringify(result.coords.latitude);
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude,
                            latitude
                        }
                    })
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    onActionPress = () => {
        const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        this.context.actionSheet().showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        console.log('user wants to select an image')
                        return this.pickImage();
                    case 1:
                        console.log('user wants to take a photo');
                        return this.takePhoto();

                    case 2:
                        console.log('user wants to get their location');
                        return this.getLocation();
                }
            },
        );
    };

    render() {
        return (
            <TouchableOpacity
                accessible={true}
                accessibilityLabel="More options"
                accessibilityHint="Allows you to choose to send an image or your geolocation."
                style={[styles.container]}
                onPress={this.onActionPress}
            >
                <View style={[styles.wrapper, this.props.wrapperStyle]}>
                    <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

CustomActions.contextTypes = {
    actionSheet: PropTypes.func,
};