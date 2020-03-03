import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { View, AsyncStorage, StyleSheet, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';


const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
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

        var firebaseConfig = {
            apiKey: "AIzaSyDUIBq-VdhxatFwL5KJcNbeaoXKecPqDeA",
            authDomain: "chatapp-56989.firebaseapp.com",
            databaseURL: "https://chatapp-56989.firebaseio.com",
            projectId: "chatapp-56989",
            storageBucket: "chatapp-56989.appspot.com",
            messagingSenderId: "208111780679",
            appId: "1:208111780679:web:0019318a5f3454bf1e4262",
            measurementId: "G-WK8GKBEJVL"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.referenceMessages = firebase.firestore().collection('messages');
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
        };
    };

    //each element of the UI displayed on screen right away using the setState() function

    componentDidMount() {
        NetInfo.addEventListener(state => {
            this.handleConnectivityChange(state)
        });
        NetInfo.fetch().then(state => {
            const isConnected = state.isConnected;
            if (isConnected) {
                this.setState({
                    isConnected: true,
                }),

                    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
                        if (!user) {
                            await firebase.auth().signInAnonymously();
                        }
                        this.setState({
                            uid: user.uid,
                            messages: []
                        });

                        this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
                    });
            } else {
                this.setState({
                    isConnected: false,
                });
                this.getMessages();
            }
        })
    }

    componentWillUnmount() {
        this.authUnsubscribe();
        this.unsubscribe();
    }

    handleConnectivityChange = (state) => {
        const isConnected = state.isConnected;
        if (isConnected === true) {
            this.setState({
                isConnected: true
            });
            this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
        } else {
            this.setState({
                isConnected: false
            });
        }
    };

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
        const message = this.state.messages[0];
        this.referenceMessages.add({
            _id: message._id,
            text: message.text || '',
            createdAt: message.createdAt,
            user: message.user,
            image: message.image || null,
            location: message.location || null,
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

    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    };

    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{this.state.loggedInText}</Text>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    messages={this.state.messages}
                    isConnected={this.state.isConnected}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: this.state.uid
                    }}
                />
                <KeyboardSpacer />
            </View>
        );
    }
}