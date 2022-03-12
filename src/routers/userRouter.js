const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const multier = require('multer')
const sharp = require('sharp')
const sendGrid = require('../email/sendGrid');

const userrouter = new express.Router()

userrouter.post('/users', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendGrid.sendWelcomeEmail(user.email, user.name)
        res.send({user, token})
    } catch (e) {
        res.status('400').send(e)
    }
})

userrouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email.toLowerCase(), req.body.password)
        const token = await user.generateAuthToken()
        console.log(token)
        res.send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

userrouter.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

userrouter.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send({error: 'Invalid updates!'})
    }

    try {
        const user = req.user

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.send(user)
    } catch (e) {
        return res.status(400).send(e)
    }
})

userrouter.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove()
        sendGrid.sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send({error: e})
    }
})

userrouter.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

userrouter.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens.length = 0
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multier({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (! file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a file with extension .jpg, .jpeg, .png'))
        }

        cb(undefined, true)
    }
})

userrouter.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({response: 'Successfully uploaded the image'});
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

userrouter.delete('/users/me/avatar', auth, async (req, res) => {
    if (req.user.avatar) {
        req.user.avatar = undefined
        await req.user.save()
    }

    res.send()
})

userrouter.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            return new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send({error: "Something went wrong"})
    }
})

module.exports = userrouter