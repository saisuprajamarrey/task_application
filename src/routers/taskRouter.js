const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const taskrouter = new express.Router()

taskrouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
            ...req.body,
            owner: req.user._id
    })

    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status('400').send(error)
    }
})

taskrouter.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)
            },
            sort
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status('400').send(e)
    }
})

taskrouter.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(404).send({error: 'Invalid updates!'})
    }

    try {
        const task = await Task.findOneAndUpdate({_id, owner: req.user._id}, req.body, {new: true, runValidators: true})
        //const task =  await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        return res.status(400).send(e)
    }
})

taskrouter.get('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(404).send(e)
    }
})

taskrouter.delete('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})

        if (!task) {
         return res.status(404).send({error: 'No such user'})
        }

        res.send(task)
    } catch (e) {
        res.status(500).send({error: e})
    }
})



module.exports = taskrouter

