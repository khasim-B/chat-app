import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const [currState,setCurrState] = useState('Sign up')
  const [fullname,setFullname] = useState('')
  const [isSubmit,setSubmit] = useState(false)
  const [email,setEmail] = useState('')
  const [pass,setPass] = useState('')
  const [bio,setBio] = useState('')
  const navigate = useNavigate()

  const {login} = useContext(AuthContext)

  const onSubmitHandler = (event) =>{
    event.preventDefault()

    if(currState === 'Sign up' && !isSubmit){
      setSubmit(true)
      return 
    }
    login(currState==='Sign up' ? 'signup' : 'login', {fullname,email,password:pass,bio})
    navigate('/')
  }
  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* left container */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />
      {/* right container */}
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
      <h2 className='flex font-medium text-2xl justify-between items-center'>{currState}{isSubmit && <img src={assets.arrow_icon} onClick={() => setSubmit(false)} className='w-5 cursor-pointer' alt='' />}</h2>
    {currState === 'Sign up' && !isSubmit && (
      <input onChange={(e) => setFullname(e.target.value)} value={fullname} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none' placeholder='Full Name' required name="" id="" />
    )}
    {!isSubmit && (
      <>
      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' name="" id="" />
      <input onChange={(e) => setPass(e.target.value)} value={pass} type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' name="" id="" />
      </>
    )}

    {
      currState === 'Sign up' && isSubmit && (
        <textarea onChange={(e) => setBio(e.target.value)} value={bio} name="" rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' id="" placeholder='Provide a short bio...' required></textarea>
      )
    }

    <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>{currState === 'Sign up' ? 'Create Account' : 'Login Now'}</button>
    <div className='flex items-center gap-2 text-sm text-gray-500'>
      <input type="checkbox" name="" id="" />
      <p>Agree to the terms of use & privacy policy.</p>
    </div>

    <div className="flex flex-col gap-2 text-center">
      {currState === 'Sign up' ? (
        <p className='text-sm text-gray-600'>Already have an account? <span onClick={() => {setCurrState('Login'); setSubmit(false)}} className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
      ) : (
        <p className='text-sm text-gray-600'>Create an account <span onClick={() => setCurrState('Sign up')} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
      )
    }
    </div>
      </form>
    </div>
  )
}

export default LoginPage