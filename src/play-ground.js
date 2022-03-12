require('./db/mongoose')
const Task = require('./models/task')

/*Task.findByIdAndRemove('5ea60a096200544880a75a66').then((task) => {
    console.log(task);
    return Task.countDocuments({completed: false})
}).then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
})*/

const deleteATaskByID = async (ID, completed) => {
    const taskRemoved = await Task.findByIdAndRemove(ID)
    const count = await Task.countDocuments({completed: completed})
    return {
        taskRemoved,
        count
    }
}

deleteATaskByID('5ea60a79e186e808dcaea712', true).then((result) => {
    console.log('removed task ' + result.taskRemoved)
    console.log(`count ${result.count}`)
}).catch((error) => {
    console.log(error)
})
//5ea60a79e186e808dcaea712