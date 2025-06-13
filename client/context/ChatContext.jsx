import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";


export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])
    const [unseenMessages, setUnseenMessages] = useState({})
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)

    const { axios, socket } = useContext(AuthContext)

    // func to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users')
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // func to get messages for selected user
    const getMessages = async (userId) => {
        try {

            const { data } = await axios.get(`/api/messages/${userId}`)
            if (data.success) {
                setMessages(data.messages)
            }
            setUnseenMessages((prev) => {
                const updated = { ...prev }
                delete updated[userId]
                return updated
            })

        } catch (error) {
            toast.error(error.message)
        }
    }


    // func to send messages to a user
    const sendMessage = async (messageData) => {
        try {

            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                setMessages((prevMessages) =>
                    Array.isArray(prevMessages) && prevMessages.length > 0
                        ? [...prevMessages, data.newMessage]
                        : [data.newMessage]
                )
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // func to subscribe to messagees for selected user
    const subscribeToMessages = async () => {
        if (!socket) return

        socket.on('newMessage', (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true
                setMessages((prev) => [...prev, newMessage])
                axios.put(`/api/messages/mark/${newMessage._id}`)
            } else {
                setUnseenMessages((prev = {}) => ({
                    ...prev,
                    [newMessage.senderId]: (prev?.[newMessage.senderId] || 0) + 1
                }))
            }
        })
    }


    // func to un subscribe to messagees for selected user

    const unSubscribeToMessages = () => {
        if (socket) socket.off('newMessage')
    }

    useEffect(() => {
        subscribeToMessages()
        return () => unSubscribeToMessages()
    }, [socket, selectedUser])

    const value = {
        messages, selectedUser, users, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    )
}