
import React, { useState, useEffect } from 'react';

const Doctor = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:3000/api/doctor';

    console.log(doctorData, 'doctorData');

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await fetch(API_URL);

                // Check if response is ok
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setDoctorData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="text-lg font-medium">Loading doctor information...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">Error loading doctor data: {error}</p>
                <p className="mt-2">Please make sure your API is running at {API_URL}</p>
            </div>
        );
    }

    // If doctorData is an array, map over it; otherwise, show single doctor
    const doctors = Array.isArray(doctorData) ? doctorData : [doctorData];

    return (
        <div>
            {doctors.map((doc, idx) => (
                <div key={doc._id || idx} className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
                    <div className="md:flex">
                        <div className="md:shrink-0">
                            {doc?.file || doc?.imageUrl ? (
                                <img
                                    src={`http://localhost:3000/uploads/${doc.file}` || doc.imageUrl}
                                    alt={`Dr. ${doc.fullName || doc.name}`}
                                    className="h-48 w-full object-cover md:h-full md:w-48"
                                />
                            ) : (
                                <div className="h-48 w-full bg-gray-200 flex items-center justify-center md:h-full md:w-48">
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="p-8">
                            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                Doctor Profile
                            </div>
                            <h2 className="block mt-1 text-xl leading-tight font-medium text-black">
                                {doc?.fullName || doc?.name || 'Name not available'}
                            </h2>
                            <div className="mt-4">
                                <p className="text-gray-700">
                                    <span className="font-medium">Age:</span> {doc?.age || 'Not specified'}
                                </p>
                                <p className="text-gray-700 mt-2">
                                    <span className="font-medium">Contact:</span> {doc?.contact || 'Not available'}
                                </p>
                                {doc?.specialty && (
                                    <p className="text-gray-700 mt-2">
                                        <span className="font-medium">Specialty:</span> {doc.specialty}
                                    </p>
                                )}
                                {doc?.experience && (
                                    <p className="text-gray-700 mt-2">
                                        <span className="font-medium">Experience:</span> {doc.experience} years
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Doctor;