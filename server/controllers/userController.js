import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/user.js"
import bcrypt from 'bcryptjs'

// sign up new user
export const signup = async (req, res) => {
    const { fullname, email, password, bio } = req.body
    try {
        if (!fullname || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" })
        }

        const user = await User.findOne({ email })

        if (user) {
            return res.json({ success: false, message: "Account already exists." })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({ fullname, email, password: hashedPassword, bio })

        const token = generateToken(newUser._id)
        res.json({ success: true, user: newUser, token, message: 'Account created successfully' })
    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}

// login 

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const userData = await User.findOne({ email })

        const ispasswordCorrect = await bcrypt.compare(password, userData.password)

        if (!ispasswordCorrect) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        const token = generateToken(userData._id)

        res.json({ success: true, userData, token, message: 'Login successful' })
    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}

// checking user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user })
}

// controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullname } = req.body

        const userId = req.user._id
        let updatedUser

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullname }, { new: true })
        } else {
            const upload = await cloudinary.uploader.upload(profilePic)

            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullname }, { new: true })
        }

        res.json({ success: true, user: updatedUser })

    } catch (error) {
        res.send({ success: false, message: error.message })
        console.log(error.message);
    }
}