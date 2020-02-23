import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { View } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

export default class Chat extends React.Component {
    // creation of the state object
    //app needs to send, receive, and display messages, so it makes sense to add messages into the state object

    constructor() {
        super();
        this.state = {
            messages: []
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
        };
    };

    //each element of the UI displayed on screen right away using the setState() function

    componentDidMount() {
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

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }))
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