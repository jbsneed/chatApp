import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, Text, TextInput, Button } from 'react-native';

export default class Start extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            color: ''
        }
    }
    render() {
        /**
         * TextInput will set users name
         * Touching TouchableOpacity will set the background color on the chat screen
         */
        return (
            <ImageBackground source={require('../assets/backgroundImage.png')} style={styles.backgroundImage}>
                <Text style={styles.title}>Chat App</Text>
                <View style={styles.container}>
                    <TextInput
                        style={styles.nameBox}
                        onChangeText={(name) => this.setState({ name })}
                        value={this.state.name}
                        placeholder="Your name"
                    />
                    <Text style={styles.text}>Choose Background Color:</Text>
                    <View style={styles.colorSelection}>
                        <TouchableOpacity
                            onPress={() => this.setState({ color: '#090c08' })}
                            style={[styles.colorButton, styles.colorOption1]}
                        />
                        <TouchableOpacity
                            onPress={() => this.setState({ color: '#474056' })}
                            style={[styles.colorButton, styles.colorOption2]}
                        />
                        <TouchableOpacity
                            onPress={() => this.setState({ color: '#8a95a5' })}
                            style={[styles.colorButton, styles.colorOption3]}
                        />
                        <TouchableOpacity
                            onPress={() => this.setState({ color: '#b9c6ae' })}
                            style={[styles.colorButton, styles.colorOption4]}
                        />
                    </View>
                    <Button
                        style={styles.button}
                        title="Start Chatting!"
                        onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })}
                    />
                </View>
            </ImageBackground>

        );
    }
}
/**
 * styles
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        height: '45%',
        width: '90%',
        marginBottom: 20
    },
    backgroundImage: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    nameBox: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 30,
        marginTop: 30,
        width: '90%'
    },
    text: {
        fontSize: 16,
        fontWeight: '300',
        color: '#757083'
    },
    title: {
        flex: 1,
        alignItems: 'center',
        fontSize: 45,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 75
    },
    colorSelection: {
        flex: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        margin: 15
    },
    colorButton: {
        height: 40,
        width: 40,
        borderRadius: 80,
        margin: 20
    },
    colorOption1: {
        backgroundColor: '#090c08'
    },
    colorOption2: {
        backgroundColor: '#474056',
    },
    colorOption3: {
        backgroundColor: '#8a95a5'
    },
    colorOption4: {
        backgroundColor: '#b9c6ae'
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#757083',
        width: '90%',
        marginBottom: 30
    }
});
