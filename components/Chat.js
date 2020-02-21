import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';

export default class Chat extends React.Component {
    constructor() {
        super();
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params.name,
        };
    };

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Hello Chat!</Text>
            </View>
        )
    }
}