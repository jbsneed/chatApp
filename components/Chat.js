import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { View } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
    // creation of the state object
    //app needs to send, receive, and display messages, so it makes sense to add messages into the state object

    constructor() {
        super();
        this.state = {
            messages: [],
            uid: 0,
            isConnected: false,
            user: {
                _id: '',
                name: '',
                avatar: ''
            },
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
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
            if (!user) {
                await firebase.auth().signInAnonymously();
            }
            //update user state with currently active user data
            this.setState({
                uid: user.uid,
                loggedInText: 'Hello there',
            });
        });

        this.unsubscribe = this.referenceMessages.onSnapshot(this.onCollectionUpdate)

        this.setState({
            messages: [
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any'
                    },
                },
                {
                    _id: 2,
                    text: this.props.navigation.state.params.name + ' has entered the chat',
                    createdAt: new Date(),
                    system: true,
                },
            ]
        })
    }

    componentWillUnmount() {
        this.authUnsubscribe();
        this.unsubscribe();
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

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }),
            () => {
                this.addMessage();
            })
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: 'red'
                    }
                }}
            />
        )
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color, justifyContent: 'center', alignItems: 'center' }}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    messages={this.state.messages}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                />
                <KeyboardSpacer />
            </View>
        )
    }
}