import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVisits, Symptom } from '../../context/VisitContext';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, X, Save } from 'lucide-react';


const VISIT_CATEGORIES = [
  'Checkup',
  'Flu/Cold',
  'Chronic Condition',
  'Specialist Consultation',
  'Emergency',
  'Follow-up',
  'Vaccination',
  'Other'
];


const SYMPTOM_CATEGORIES = [
  'Pain',
  'Respiratory',
  'Digestive',
  'Neurological',
  'Skin',
  'Cardiovascular',
  'General'
];

const VisitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addVisit, updateVisit, getVisit, loading } = useVisits();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    doctorName: '',
    visitDate: new Date().toISOString().split('T')[0],
    reason: '',
    diagnosis: '',
    notes: '',
    followUpDate: '',
    category: 'Checkup',
    medications: [''],
    testResults: [''],
  });
  
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: '1', name: '', severity: 5, category: 'General' }
  ]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  

  useEffect(() => {
    if (id) {
      const visitData = getVisit(id);
      if (visitData) {
        setFormData({
          doctorName: visitData.doctorName,
          visitDate: visitData.visitDate.split('T')[0],
          reason: visitData.reason,
          diagnosis: visitData.diagnosis,
          notes: visitData.notes,
          followUpDate: visitData.followUpDate ? visitData.followUpDate.split('T')[0] : '',
          category: visitData.category,
          medications: visitData.medications || [''],
          testResults: visitData.testResults || [''],
        });
        setSymptoms(visitData.symptoms);
      }
    }
  }, [id, getVisit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleArrayChange = (index: number, field: 'medications' | 'testResults', value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };
  
  const addArrayItem = (field: 'medications' | 'testResults') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };
  
  const removeArrayItem = (index: number, field: 'medications' | 'testResults') => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray.length ? newArray : [''] };
    });
  };
  
  const handleSymptomChange = (index: number, field: keyof Symptom, value: string | number) => {
    setSymptoms(prev => {
      const newSymptoms = [...prev];
      newSymptoms[index] = { ...newSymptoms[index], [field]: value };
      return newSymptoms;
    });
  };
  
  const addSymptom = () => {
    setSymptoms(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', severity: 5, category: 'General' }
    ]);
  };
  
  const removeSymptom = (index: number) => {
    setSymptoms(prev => {
      const newSymptoms = [...prev];
      newSymptoms.splice(index, 1);
      return newSymptoms.length ? newSymptoms : [{ id: Date.now().toString(), name: '', severity: 5, category: 'General' }];
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Check if at least one symptom has a name
    const hasNamedSymptom = symptoms.some(s => s.name.trim() !== '');
    if (!hasNamedSymptom) {
      newErrors.symptoms = 'At least one symptom must be provided';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const filteredMedications = formData.medications.filter(med => med.trim() !== '');
    const filteredTestResults = formData.testResults.filter(test => test.trim() !== '');
    
    const filteredSymptoms = symptoms.filter(s => s.name.trim() !== '');
    
    const visitData = {
      ...formData,
      medications: filteredMedications,
      testResults: filteredTestResults,
      symptoms: filteredSymptoms,
      userId: currentUser?.id || '',
    };
    
    try {
      if (id) {
        await updateVisit(id, visitData);
      } else {
        await addVisit(visitData);
      }
      navigate('/history');
    } catch (error) {
      console.error('Error saving visit:', error);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Medical Visit' : 'Add New Medical Visit'}
        </h1>
        <p className="mt-2 text-gray-600">
          {id ? 'Update the details of your medical visit' : 'Record the details of your doctor visit'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name*
            </label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.doctorName ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            />
            {errors.doctorName && (
              <p className="mt-1 text-sm text-red-500">{errors.doctorName}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
              Visit Date*
            </label>
            <input
              type="date"
              id="visitDate"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleChange}
              className={`w-full rounded-md border ${errors.visitDate ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            />
            {errors.visitDate && (
              <p className="mt-1 text-sm text-red-500">{errors.visitDate}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit*
          </label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.reason ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Visit Category*
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          >
            {VISIT_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
            Diagnosis
          </label>
          <input
            type="text"
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Symptoms*
            </label>
            <button
              type="button"
              onClick={addSymptom}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Symptom
            </button>
          </div>
          
          {errors.symptoms && (
            <p className="mb-2 text-sm text-red-500">{errors.symptoms}</p>
          )}
          
          {symptoms.map((symptom, index) => (
            <div key={symptom.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-md">
              <div className="md:col-span-2">
                <label htmlFor={`symptom-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                  Symptom Name
                </label>
                <input
                  type="text"
                  id={`symptom-${index}`}
                  value={symptom.name}
                  onChange={(e) => handleSymptomChange(index, 'name', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor={`category-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                  Category
                </label>
                <select
                  id={`category-${index}`}
                  value={symptom.category}
                  onChange={(e) => handleSymptomChange(index, 'category', e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  {SYMPTOM_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <div className="flex-grow">
                  <label htmlFor={`severity-${index}`} className="block text-xs font-medium text-gray-500 mb-1">
                    Severity (1-10): {symptom.severity}
                  </label>
                  <input
                    type="range"
                    id={`severity-${index}`}
                    min="1"
                    max="10"
                    value={symptom.severity}
                    onChange={(e) => handleSymptomChange(index, 'severity', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeSymptom(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={symptoms.length === 1}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Medications
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('medications')}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Medication
            </button>
          </div>
          
          {formData.medications.map((medication, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={medication}
                onChange={(e) => handleArrayChange(index, 'medications', e.target.value)}
                placeholder="Medication name and dosage"
                className="flex-grow rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'medications')}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={formData.medications.length === 1}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Test Results
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('testResults')}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Test Result
            </button>
          </div>
          
          {formData.testResults.map((test, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={test}
                onChange={(e) => handleArrayChange(index, 'testResults', e.target.value)}
                placeholder="Test name and result"
                className="flex-grow rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'testResults')}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={formData.testResults.length === 1}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
            Follow-up Date (if applicable)
          </label>
          <input
            type="date"
            id="followUpDate"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : id ? 'Update Visit' : 'Save Visit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitForm;