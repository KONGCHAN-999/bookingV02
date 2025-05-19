const Blog = require('../Models/blogs')

exports.read = async (req, res) => {
    try {
        // code
        const id = req.params.id
        const read = await Blog.findOne({ _id: id }).exec();
        res.send(read)
    } catch (err) {
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.list = async (req, res) => {
    try {
        const list = await Blog.find({}).exec();
        res.send(list)
    } catch (err) {
        console.error('Error in list:', err);
        res.status(500).send({ error: err.message || 'Server Error' })
    }
}

exports.create = async (req, res) => {
    try {
        // code
        console.log(req.body)
        const create = await Blog(req.body).save()
        res.send(create)
    } catch (err) {
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.update = async (req, res) => {
    try {
        // code
        const id = req.params.id
        const update = await Blog
            .findOneAndUpdate({ _id: id }, req.body, { new: true })
            .exec()
        res.send(update)

    } catch (err) {
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.remove = async (req, res) => {
    try {
        // code
        const id = req.params.id
        const remove = await Blog.findOneAndDelete({_id:id}).exec()
        res.send(remove)
    } catch (err) {
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}