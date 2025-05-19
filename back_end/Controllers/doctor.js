
const Doctor = require('../Models/doctors')

exports.read = async (req, res) => {
    try {
        const id = req.params.id
        const doctor = await Doctor.findOne({ _id: id }).exec();
        if (!doctor) {
            return res.status(404).send({ error: 'Doctor not found' });
        }
        res.send(doctor)
    } catch (err) {
        console.error('Error in read:', err);
        res.status(500).send({ error: err.message || 'Server Error' })
    }
}

exports.list = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).exec();
        res.send(doctors)
    } catch (err) {
        console.error('Error in list:', err);
        res.status(500).send({ error: err.message || 'Server Error' })
    }
}

exports.create = async (req, res) => {
    try {
        // code
        console.log(req.body)
        const create = await Doctor(req.body).save()
        res.send(create)
    } catch (err) {
        // error
        console.log(err)
        res.status(500).send('Server Error')
    }
}

exports.update = async (req, res) => {
    try {
        const id = req.params.id
        console.log('Update request body:', req.body);
        const updated = await Doctor
            .findOneAndUpdate({ _id: id }, req.body, { new: true })
            .exec()
        res.send(updated)
    } catch (err) {
        console.error('Error in update:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).send({ error: err.message });
        }
        res.status(500).send({ error: err.message || 'Server Error' })
    }
}

exports.remove = async (req, res) => {
    try {
        const id = req.params.id
        const removed = await Doctor.findOneAndDelete({ _id: id }).exec()
        if (!removed) {
            return res.status(404).send({ error: 'Doctor not found' });
        }
        res.send({ message: 'Doctor deleted successfully', doctor: removed })
    } catch (err) {
        console.error('Error in remove:', err);
        res.status(500).send({ error: err.message || 'Server Error' })
    }
}

