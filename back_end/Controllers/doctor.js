const Doctor = require('../Models/doctors'); // Make sure path matches your file structure
const fs = require('fs');
const path = require('path');

// Create new doctor
exports.create = async (req, res) => {
    try {
        const data = { ...req.body };
        
        // Handle file upload
        if (req.file) {
            data.file = req.file.filename;
        }
        // Create new doctor
        const newDoctor = new Doctor(data);
        const savedDoctor = await newDoctor.save();
        res.status(201).json(savedDoctor);
        
    } catch (err) {
        console.error('Error creating doctor:', err);
        
        // Delete uploaded file if doctor creation fails
        if (req.file) {
            const filePath = path.join('uploads', req.file.filename);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            });
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                details: err.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
};

// Update doctor
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('Update request for ID:', id);
        console.log('Update request body:', req.body);
        console.log('Update request file:', req.file);
        
        // Find existing doctor
        const existingDoctor = await Doctor.findById(id);
        if (!existingDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        const updateData = { ...req.body };
        
        // Handle file upload for update
        if (req.file) {
            // Delete old file if it exists
            if (existingDoctor.file) {
                const oldFilePath = path.join('uploads', existingDoctor.file);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.log('Old file not found or already deleted');
                });
            }
            updateData.file = req.file.filename;
        }
        
        // Update doctor
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        console.log('Doctor updated successfully:', updatedDoctor);
        res.json(updatedDoctor);
        
    } catch (err) {
        console.error('Error updating doctor:', err);
        
        // Delete uploaded file if update fails
        if (req.file) {
            const filePath = path.join('uploads', req.file.filename);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr);
            });
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                details: err.message 
            });
        }
        
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid ID format' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
};

// Get all doctors
exports.list = async (req, res) => {
    try {
        const doctors = await Doctor.find({}).sort({ createdAt: -1 });
        res.json(doctors);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
};

// Get single doctor
exports.read = async (req, res) => {
    try {
        const id = req.params.id;
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (err) {
        console.error('Error fetching doctor:', err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
};

// Delete doctor
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        const doctor = await Doctor.findById(id);
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Delete associated file
        if (doctor.file) {
            const filePath = path.join('uploads', doctor.file);
            fs.unlink(filePath, (err) => {
                if (err) console.log('File not found or already deleted');
            });
        }
        
        await Doctor.findByIdAndDelete(id);
        res.json({ message: 'Doctor deleted successfully' });
        
    } catch (err) {
        console.error('Error deleting doctor:', err);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        
        res.status(500).json({ 
            message: 'Server Error', 
            error: err.message 
        });
    }
};