import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

export const AuthContext = createContext()

const backendUrl = import.meta.env.VITE_BACKEND_URI
axios.defaults.baseURL = backendUrl

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token'))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)


    // check if user authenticated and if so, set user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check')

            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // login func to handle user conn and socket conn

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data.success) {
                setAuthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common['token'] = data.token
                setToken(data.token)
                localStorage.setItem('token', data.token)
                toast.success(data.message)
                return true
            } else {
                toast.error(error.message)
                return false
            }

        } catch (error) {
            toast.error(error.message)
            return false
        }
    }


    // logout func to handle logout and socket dis-conn

    const logout = async () => {
        localStorage.removeItem('token')
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common['token'] = null
        toast.success('Logged out successfully')
        socket.disconnect()
    }

    // update profile func to handle user profile updates

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', body)

            if (data.success) {
                setAuthUser(data.user)
                toast.success('Profile updates successfully')
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }


    // connect socket to handle online user updates and socket connection
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        })
        newSocket.connect()
        setSocket(newSocket)

        newSocket.on('getOnlineUsers', (userIds) => {
            setOnlineUsers(userIds)
        })

    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['token'] = token
         } checkAuth()
        
    }, [])


    const value = {
        axios, authUser, onlineUsers, socket, login, logout, updateProfile,
    }

    return (
        <AuthContext.Provider value={value}> {children}</AuthContext.Provider>
    )

}



