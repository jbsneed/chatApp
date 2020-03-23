import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { View, Platform, AsyncStorage, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends Component {
    // creation of the state object
    //app needs to send, receive, and display messages, so it makes sense to add messages into the state object

    constructor() {
        super();
        this.state = {
            isConnected: false,
            messages: [],
            uid: 0,
            image: null
        };

        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyDUIBq-VdhxatFwL5KJcNbeaoXKecPqDeA",
                authDomain: "chatapp-56989.firebaseapp.com",
                databaseURL: "https://chatapp-56989.firebaseio.com",
                projectId: "chatapp-56989",
                storageBucket: "chatapp-56989.appspot.com",
                messagingSenderId: "208111780679",
                appId: "1:208111780679:web:0019318a5f3454bf1e4262",
                measurementId: "G-WK8GKBEJVL"
            });
        }
        this.referenceChatUser = null;
        this.referenceMessages = firebase.firestore().collection('messages');
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: `${navigation.state.params.name}'s Chat`,
        };
    };

    //each element of the UI displayed on screen right away using the setState() function

    componentDidMount() {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
                    if (!user) {
                        try {
                            await firebase.auth().signInAnonymously();
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    this.setState({
                        uid: user.uid,
                        loggedInText: 'Welcome to chat!',
                        isConnected: true,
                        user: {
                            _id: user.uid,
                            name: this.props.navigation.state.params.name,
                        },
                        messages: []
                    });
                    this.referenceChatUser = firebase.firestore()
                        .collection('messages')
                        .orderBy('createdAt', 'desc')
                    this.unsubscribe = this.referenceChatUser.onSnapshot(this.onCollectionUpdate);
                });
            } else {
                this.getMessages();
                this.setState({
                    isConnected: false,
                });
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.authUnsubscribe();
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        querySnapshot.forEach(doc => {
            let data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: data.user,
                image: data.image || '',
                location: data.location || null,
            });
        });
        this.setState({
            messages
        });
    };

    //gets messages from AsyncStorage
    getMessages = async () => {
        let messages = [];
        try {
            messages = (await AsyncStorage.getItem('messages')) || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    addMessage() {
        console.log(this.state.user);
        this.referenceMessages.add({
            _id: this.state.messages[0]._id,
            text: this.state.messages[0].text || '',
            createdAt: this.state.messages[0].createdAt,
            user: this.state.user,
            uid: this.state.uid,
            image: this.state.messages[0].image || '',
            location: this.state.messages[0].location || null,
        });
    };

    //saves messages in AsyncStorage
    saveMessages = async () => {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    };

    // deletes messages from AsyncStorage
    deleteMessages = async () => {
        try {
            await AsyncStorage.removeItem('messages');
        } catch (err) {
            console.log(err.message);
        }
    };

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }),
            () => {
                this.addMessage();
                this.saveMessages();
            })
    }

    renderInputToolbar(props) {
        if (this.state.isConnected) {
            return (
                <InputToolbar
                    {...props}
                />
            );
        }
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: 'blue'
                    },
                    left: {
                        backgroundColor: 'green'
                    }
                }}
            />
        )
    }

    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView style={{
                    width: 150,
                    height: 100,
                    borderRadius: 13,
                    margin: 3,
                }}
                    region={{
                        longitude: currentMessage.location.longitude,
                        latitude: currentMessage.location.latitude,
                        longitudeDelta: 0.0421,
                        latitudeDelta: 0.0922
                    }}
                />
            );
        }
        return null;
    }

    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color }}>
                <Text>{this.state.loggedInText}</Text>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    messages={this.state.messages}
                    isConnected={this.state.isConnected}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.user}
                />
                {Platform.OS === "android" ? <KeyboardSpacer /> : null}
            </View>
        );
    }
}