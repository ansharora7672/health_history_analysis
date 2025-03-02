import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVisits, MedicalVisit } from '../../context/VisitContext';
import { useAuth } from '../../context/AuthContext';
import { Edit, Trash2, Search, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const VisitHistory = () => {
  const { visits, deleteVisit } = useVisits();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const userVisits = visits.filter(visit => visit.userId === currentUser?.id);
  
  const categories = Array.from(new Set(userVisits.map(visit => visit.category)));
  
  const filteredVisits = userVisits.filter(visit => {
    const matchesSearch = searchTerm === '' || 
      visit.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || visit.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const sortedVisits = [...filteredVisits].sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );
  
  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };
  
  const handleConfirmDelete = async (id: string) => {
    await deleteVisit(id);
    setConfirmDelete(null);
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visit History</h1>
        <p className="mt-2 text-gray-600">View and manage your medical visit records</p>
      </div>
  
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by doctor, reason, or diagnosis"
                className="pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedVisits.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedVisits.map(visit => (
              <div key={visit.id} className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{visit.doctorName}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {visit.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {format(parseISO(visit.visitDate), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Reason:</span> {visit.reason}
                    </p>
                    {visit.diagnosis && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                      </p>
                    )}
                    
                    {visit.symptoms.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Symptoms:</h4>
                        <div className="flex flex-wrap gap-2">
                          {visit.symptoms.map(symptom => (
                            <div 
                              key={symptom.id} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              title={`Severity: ${symptom.severity}/10`}
                            >
                              {symptom.name} ({symptom.severity}/10)
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {visit.medications && visit.medications.length > 0 && visit.medications[0] !== '' && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Medications:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {visit.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {visit.followUpDate && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Follow-up Date:</h4>
                        <p className="text-sm text-gray-700">
                          {format(parseISO(visit.followUpDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-visit/${visit.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(visit.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
          
                {confirmDelete === visit.id && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700 mb-2">
                      Are you sure you want to delete this visit record? This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfirmDelete(visit.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No visit records found</p>
            <Link
              to="/add-visit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Your First Visit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitHistory;