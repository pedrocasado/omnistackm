import axios from 'axios'

const api = axios.create({
    baseURL: 'https://omnistackb.herokuapp.com',
})

export default api
