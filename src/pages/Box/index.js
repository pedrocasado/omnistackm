import React, { Component } from 'react'
import AsyncStorage from '@react-native-community/async-storage'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import styles from './styles'
import api from '../../services/api'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { distanceInWords } from 'date-fns'
import pt from 'date-fns/locale/pt'
import ImagePicker from 'react-native-image-picker'
import RNFS from 'react-native-fs'
import FileViewer from 'react-native-file-viewer'
import socket from 'socket.io-client'

export default class Box extends Component {
    state = {
        box: '',
    }

    async componentDidMount() {
        const boxId = await AsyncStorage.getItem('@RocketBox:box')

        this.subscribeToNewFiles(boxId)

        const response = await api.get(`/boxes/${boxId}`)

        this.setState({ box: response.data })
    }

    subscribeToNewFiles = boxId => {
        const io = socket('https://omnistackb.herokuapp.com')

        io.emit('connectRoom', boxId)

        // keep
        io.on('file', data => {
            this.setState({
                box: {
                    ...this.state.box, // clone box
                    files: [data, ...this.state.box.files], // keep files that already exists and append new one
                },
            })
        })
    }

    openFile = async file => {
        try {
            const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`

            await RNFS.downloadFile({
                fromUrl: file.url,
                toFile: filePath,
            })

            await FileViewer.open(filePath)
        } catch (err) {
            console.log('error')
        }
    }
    renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                this.openFile(item)
            }}
            style={styles.file}
        >
            <View style={styles.fileInfo}>
                <Icon name="insert-drive-file" size={24} color="#A5cFFF" />
                <Text style={styles.fileTile}>{item.title}</Text>
            </View>

            <Text style={styles.fileDate}>
                há{' '}
                {distanceInWords(item.createdAt, new Date(), {
                    locale: pt,
                })}
            </Text>
        </TouchableOpacity>
    )

    handleUpload = () => {
        ImagePicker.launchImageLibrary({}, async upload => {
            if (upload.error) {
                console.log('ImagePicker error')
            } else if (upload.didCancel) {
                console.log('Canceled')
            } else {
                const data = new FormData()

                const [prefix, suffix] = upload.fileName.split('.')
                const ext = suffix.toLowerCase() == 'heic' ? 'jpg' : suffix

                data.append('file', {
                    uri: upload.uri,
                    type: upload.type,
                    name: `${prefix}.${ext}`,
                })

                api.post(`boxes/${this.state.box._id}/files`, data)
            }
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.boxTitle}>{this.state.box.title}</Text>

                <FlatList
                    data={this.state.box.files}
                    style={styles.list}
                    keyExtractor={file => file._id}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )}
                    renderItem={this.renderItem}
                />

                <TouchableOpacity
                    style={styles.fab}
                    onPress={this.handleUpload}
                >
                    <Icon name="cloud-upload" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
        )
    }
}
