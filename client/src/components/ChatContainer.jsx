import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMsgTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ChatContainer = () => {
  const {messages,selectedUser,setSelectedUser,sendMessage,getMessages} = useContext(ChatContext)
  const {authUser,onlineUsers} = useContext(AuthContext)

  const [input,setInput] = useState('')

  const scrollEnd = useRef()


  const handleSendImage = async (e) => {
    e.preventDefault()

    const file = e.target.files[0]

    if(!file || !file.type.startsWith("image/")){
      toast.error("select an image file")
      return
    }

    const reader = new FileReader()

    reader.onloadend = async () =>{
      await sendMessage({image: reader.result})
      e.target.value = ''
    }

    reader.readAsDataURL(file)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if(input.trim() === '') return null
    
    await sendMessage({text: input.trim()})
    setInput("")
  }
  

  useEffect(() => {
    if(selectedUser){
      getMessages(selectedUser._id)
    }
  },[selectedUser])
  
  useEffect(() => {
    if(scrollEnd.current && messages){
      scrollEnd.current.scrollIntoView({behavior : 'smooth'})
    }
  },[messages])

  console.log(messages);
  

  return selectedUser ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>

      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <p className="flex-1 text-lg text-white flex items-center gap-2">{selectedUser.fullname}{onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}</p>
        <img src={assets.arrow_icon} alt="" className='md:hidden max-w-7' onClick={() => setSelectedUser(null)} />
        <img src={assets.help_icon} className='max-md:hidden max-w-5' alt="" />
      </div>

      {/* Chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages?.map((msg,ind) => (
          <div key={ind} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex flex-row-reverse'}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
            ) : (<p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId !== authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>{msg.text}</p>)}
          <div className="text-center text-xs">
            <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} className='rounded-full w-7' alt="" />
            <p className='text-gray-500'>{formatMsgTime(msg.createdAt)}</p>

          </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>

        {/* bottom area */}

        <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
          <div className='flex flex-1 items-center bg-gray-100/12 px-3 rounded-full'>
            <input type="text" onChange={(e) => {setInput(e.target.value)}} value={input} onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage(e) : null} placeholder="Send a message?" className='flex-1 text-sm rounded-lg p-3 border-none outline-none text-white placeholder-gray-400' />
            <input type="file" onChange={handleSendImage} accept="image/png, image/jpeg" hidden id="image" />
            <label htmlFor="image">
              <img src={assets.gallery_icon} alt="" className='w-5 mr-3 cursor-pointer' />
            </label> 
          </div>
          <img src={assets.send_button} alt="" className='w-7 cursor-pointer' onClick={handleSendMessage} />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden '>
      <img src={assets.logo_icon} className='max-w-16' alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere.</p>
    </div>
  )
}

export default ChatContainer