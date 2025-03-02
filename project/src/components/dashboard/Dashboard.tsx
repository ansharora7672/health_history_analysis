import React from 'react';
import { Link } from 'react-router-dom';
import { useVisits } from '../../context/VisitContext';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, History, BarChart2, Calendar, AlertCircle } from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';

const Dashboard = () => {
  const { visits } = useVisits();
  const { currentUser } = useAuth();
  
  const userVisits = visits.filter(visit => visit.userId === currentUser?.id);
  
  const sortedVisits = [...userVisits].sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );
  
  const recentVisits = sortedVisits.slice(0, 3);

  const today = new Date();
  const upcomingFollowUps = sortedVisits
    .filter(visit => visit.followUpDate && isAfter(parseISO(visit.followUpDate), today))
    .sort((a, b) => parseISO(a.followUpDate!).getTime() - parseISO(b.followUpDate!).getTime())
    .slice(0, 3);
 
  const totalVisits = userVisits.length;
  const visitsThisMonth = userVisits.filter(visit => {
    const visitDate = parseISO(visit.visitDate);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return isAfter(visitDate, firstDayOfMonth) || visitDate.getTime() === firstDayOfMonth.getTime();
  }).length;
  
  const categories = userVisits.reduce((acc: Record<string, number>, visit) => {
    acc[visit.category] = (acc[visit.category] || 0) + 1;
    return acc;
  }, {});
  
  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentUser?.name}</h1>
        <p className="mt-2 text-gray-600">Track and manage your medical visits and health data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Visits</h2>
          <p className="text-3xl font-bold text-indigo-600">{totalVisits}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Visits This Month</h2>
          <p className="text-3xl font-bold text-indigo-600">{visitsThisMonth}</p>
          <p className="text-sm text-gray-500 mt-1">{format(today, 'MMMM yyyy')}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Top Health Categories</h2>
          {topCategories.length > 0 ? (
            <ul className="mt-2">
              {topCategories.map(([category, count]) => (
                <li key={category} className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">{category}</span>
                  <span className="text-indigo-600 font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">No visits recorded yet</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/add-visit" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <PlusCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Visit</h2>
              <p className="text-sm text-gray-500">Record a new doctor visit</p>
            </div>
          </div>
        </Link>
        
        <Link to="/history" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <History className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">View History</h2>
              <p className="text-sm text-gray-500">See all your past visits</p>
            </div>
          </div>
        </Link>
        
        <Link to="/analytics" className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <BarChart2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-500">View health trends and insights</p>
            </div>
          </div>
        </Link>
      </div>
    
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentVisits.length > 0 ? (
            recentVisits.map(visit => (
              <div key={visit.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{visit.doctorName}</h3>
                    <p className="text-sm text-gray-500">{format(parseISO(visit.visitDate), 'MMMM d, yyyy')}</p>
                    <p className="text-sm text-gray-700 mt-1">{visit.reason}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {visit.category}
                      </span>
                    </div>
                  </div>
                  <Link to={`/edit-visit/${visit.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center">
              <p className="text-gray-500">No visits recorded yet</p>
              <Link to="/add-visit" className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800">
                <PlusCircle className="h-4 w-4 mr-1" />
                Add your first visit
              </Link>
            </div>
          )}
        </div>
        {recentVisits.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link to="/history" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View all visits
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingFollowUps.length > 0 ? (
            upcomingFollowUps.map(visit => (
              <div key={visit.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {isAfter(parseISO(visit.followUpDate!), addDays(today, 7)) ? (
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Follow-up: {visit.doctorName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(visit.followUpDate!), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{visit.reason}</p>
                    <Link to={`/edit-visit/${visit.id}`} className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center">
              <p className="text-gray-500">No upcoming follow-ups</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;