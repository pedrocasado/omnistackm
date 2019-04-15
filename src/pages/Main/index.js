import React, { Component } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'

import api from '../../services/api'

import styles from './styles'

import logo from '../../assets/logo.png'

export default class Main extends Component {
    state = {
        newBoxName: '',
    }

    async componentDidMount() {
        const boxId = await AsyncStorage.getItem('@RocketBox:box')

        // dont need to pass box as parameter because its already in AsyncStorage
        // and we will grab it from there
        if (boxId) {
            this.props.navigation.navigate('Box')
        }
    }

    handleSignIn = async () => {
        const response = await api.post('/boxes', {
            title: this.state.newBoxName,
        })

        await AsyncStorage.setItem('@RocketBox:box', response.data._id)

        // navigate user to another route
        this.props.navigation.navigate('Box')
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Oi</Text>
                <Image style={styles.logo} source={logo} />

                <TextInput
                    style={styles.input}
                    placeholder="Crie um box"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    // underlineColorAndroid="tranparent"
                    value={this.state.newBoxName}
                    onChangeText={text => this.setState({ newBoxName: text })}
                />

                <TouchableOpacity
                    onPress={this.handleSignIn}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Criar</Text>
                </TouchableOpacity>
            </View>
        )
    }
}
