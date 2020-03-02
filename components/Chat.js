import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { View, AsyncStorage, StyleSheet, Text } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import NetInfo from '@react-native-community/netinfo';

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
            isConnected: false,
            user: {
                _id: '',
                name: '',
                avatar: ''
            },
            uid: 0
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
        })
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
        this.unsubscribeMessageUser();
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

    getMessages = async () => {
        let messages = [];
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (err) {
            console.log(err.message);
        }
    }

    addMessage() {
        console.log(this.state.user)
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

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{this.state.loggedInText}</Text>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={this.state.user}
                />
                <KeyboardSpacer />
            </View>
        );
    }
}