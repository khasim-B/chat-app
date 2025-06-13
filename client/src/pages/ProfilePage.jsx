import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {
  const {authUser, updateProfile} = useContext(AuthContext)
  const [selectedImg, setSelectedImage] = useState(null)
  const navigate = useNavigate()

  const [name, setName] = useState(authUser.fullname)
  const [bio, setBio] = useState(authUser.bio)

  console.log(authUser);
  

  const handleSubmit = async (e) => {
    e.preventDefault()

    if(!selectedImg){
      await updateProfile({fullname:name,bio})
      navigate('/')
      return
    }
    
    const reader = new FileReader()
    reader.readAsDataURL(selectedImg)
    reader.onload = async () => {
      const base64Img = reader.result
      await updateProfile({profilePic:base64Img, fullname:name,bio}) 
      navigate('/')
    }
  }
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form action="" onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg'>Profile details</h3>
          <label className='flex items-center gap-3 cursor-pointer' htmlFor="avatar">
            <input onChange={(e) => setSelectedImage(e.target.files[0])} type="file" accept='.png, .jpg, .jpeg' name="" id="avatar" hidden />
            <img src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} className={`w-12 h-12 ${selectedImg && 'rounded-full'}`} alt="" />upload profile image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder='Your Name' className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' name="" id="" />
          <textarea name="" placeholder='Write profile bio' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' rows={4} onChange={(e) => setBio(e.target.value)} value={bio} id=""></textarea>
          <button type="submit" className='bg-gradient-to-r from-purple-400 to-violet-600 p-2 text-white rounded-full text-lg cursor-pointer' >Save</button>
        </form>
        <img src={authUser?.profilePic || assets.logo_icon } alt="" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`} />
      </div>
    </div>
  )
}

export default ProfilePage