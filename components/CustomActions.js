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
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (status === 'granted') {
            try {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'Images',
                });
            } catch (error) {
                console.log(error);
            }

            if (!result.cancelled) {
                try {
                    const imageUrlLink = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrlLink });
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    //requests permission to camera and camera roll and store photo as state and return uri string
    takePhoto = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL)

        if (status === 'greanted') {
            try {
                let result = await ImagePicker.launchCameraAsync({
                    mediaTypes: 'Images',
                });
            } catch (error) {
                console.log(error);
            }

            if (!result.cancelled) {
                try {
                    const imageUrlLink = await this.uploadImage(result.uri);
                    this.props.onSend({ image: imageUrlLink });
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    //uploads image as blob to cloud storage
    uploadImage = async (uri) => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttypRequest();
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
        const imageArrayLength = getImageName.length - 1;
        const ref = firebase.storage().ref().child(getImageName[imageArrayLength]);
        console.log(ref, getImageName[imageArrayLength]);
        const snapshot = await ref.put(blob);

        blob.close();

        const imageURL = await snapshot.ref.getDownloadURL();
        return imageURL;
    }

    //requests permission fro location
    getLocation = async () => {
        const { status } = await Permissions.askAsync(Permissions.LOCATION);

        if (status === 'granted') {
            try {
                const result = await Location.getCurrentPositionAsync({});
                if (result) {
                    this.props.onSend({
                        location: {
                            longitude: result.coords.longitude,
                            latitude: result.coords.latitude,
                        },
                    });
                }
            } catch (error) {
                console.log(error);
            }
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
                        this.pickImage()
                        return;
                    case 1:
                        this.takePhoto()
                        return;
                    case 2:
                        this.getLocation()
                        return;
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
    constainer: {
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