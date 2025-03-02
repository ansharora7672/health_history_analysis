import React, { useState, useMemo } from 'react';
import { useVisits, MedicalVisit, Symptom } from '../../context/VisitContext';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = () => {
  const { visits } = useVisits();
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('6');

  const userVisits = useMemo(() => {
    return visits.filter(visit => visit.userId === currentUser?.id);
  }, [visits, currentUser]);
  

  const filteredVisits = useMemo(() => {
    const months = parseInt(timeRange);
    const cutoffDate = subMonths(new Date(), months);
    
    return userVisits.filter(visit => {
      const visitDate = parseISO(visit.visitDate);
      return visitDate >= cutoffDate;
    });
  }, [userVisits, timeRange]);
  

  const visitsByMonth = useMemo(() => {
    if (filteredVisits.length === 0) return [];

    const dates = filteredVisits.map(visit => parseISO(visit.visitDate));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date();
    
    
    const monthRange = eachMonthOfInterval({
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate)
    });
    

    return monthRange.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthVisits = filteredVisits.filter(visit => {
        const visitDate = parseISO(visit.visitDate);
        return visitDate >= monthStart && visitDate <= monthEnd;
      });
      
      return {
        month: format(month, 'MMM yyyy'),
        visits: monthVisits.length
      };
    });
  }, [filteredVisits]);
  

  const visitsByCategory = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    
    filteredVisits.forEach(visit => {
      categoryCounts[visit.category] = (categoryCounts[visit.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisits]);
  
  
  const symptomsByCategory = useMemo(() => {
    const categoryData: Record<string, { count: number, totalSeverity: number }> = {};
    
    filteredVisits.forEach(visit => {
      visit.symptoms.forEach(symptom => {
        if (!categoryData[symptom.category]) {
          categoryData[symptom.category] = { count: 0, totalSeverity: 0 };
        }
        categoryData[symptom.category].count += 1;
        categoryData[symptom.category].totalSeverity += symptom.severity;
      });
    });
    
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      count: data.count,
      averageSeverity: data.count > 0 ? Math.round((data.totalSeverity / data.count) * 10) / 10 : 0
    }));
  }, [filteredVisits]);
  
 
  const topSymptoms = useMemo(() => {
    const symptomCounts: Record<string, { count: number, totalSeverity: number }> = {};
    
    filteredVisits.forEach(visit => {
      visit.symptoms.forEach(symptom => {
        if (symptom.name.trim() === '') return;
        
        if (!symptomCounts[symptom.name]) {
          symptomCounts[symptom.name] = { count: 0, totalSeverity: 0 };
        }
        symptomCounts[symptom.name].count += 1;
        symptomCounts[symptom.name].totalSeverity += symptom.severity;
      });
    });
    
    return Object.entries(symptomCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageSeverity: Math.round((data.totalSeverity / data.count) * 10) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredVisits]);
  

  const stats = useMemo(() => {
    const totalVisits = filteredVisits.length;
    
   
    let totalSymptoms = 0;
    filteredVisits.forEach(visit => {
      totalSymptoms += visit.symptoms.filter(s => s.name.trim() !== '').length;
    });
    const avgSymptomsPerVisit = totalVisits > 0 ? Math.round((totalSymptoms / totalVisits) * 10) / 10 : 0;
    
   
    let totalSeverity = 0;
    let severityCount = 0;
    filteredVisits.forEach(visit => {
      visit.symptoms.forEach(symptom => {
        if (symptom.name.trim() !== '') {
          totalSeverity += symptom.severity;
          severityCount++;
        }
      });
    });
    const avgSeverity = severityCount > 0 ? Math.round((totalSeverity / severityCount) * 10) / 10 : 0;
    
  
    const categories: Record<string, number> = {};
    filteredVisits.forEach(visit => {
      categories[visit.category] = (categories[visit.category] || 0) + 1;
    });
    
    let mostCommonCategory = '';
    let maxCount = 0;
    Object.entries(categories).forEach(([category, count]) => {
      if (count > maxCount) {
        mostCommonCategory = category;
        maxCount = count;
      }
    });
    
    return {
      totalVisits,
      avgSymptomsPerVisit,
      avgSeverity,
      mostCommonCategory
    };
  }, [filteredVisits]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Health Analytics</h1>
        <p className="mt-2 text-gray-600">Visualize and analyze your health data</p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
          Time Range
        </label>
        <select
          id="timeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full md:w-64 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="3">Last 3 months</option>
          <option value="6">Last 6 months</option>
          <option value="12">Last 12 months</option>
          <option value="24">Last 2 years</option>
          <option value="60">Last 5 years</option>
        </select>
      </div>
      
      {userVisits.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No visit data available for analysis</p>
          <p className="text-sm text-gray-600">
            Add some medical visits to see analytics and insights about your health.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Visits</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalVisits}</p>
              <p className="text-sm text-gray-500 mt-1">In selected time period</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Avg. Symptoms</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats.avgSymptomsPerVisit}</p>
              <p className="text-sm text-gray-500 mt-1">Per visit</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Avg. Severity</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats.avgSeverity}</p>
              <p className="text-sm text-gray-500 mt-1">Scale of 1-10</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Most Common</h2>
              <p className="text-3xl font-bold text-indigo-600">{stats.mostCommonCategory || "N/A"}</p>
              <p className="text-sm text-gray-500 mt-1">Visit category</p>
            </div>
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Frequency</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={visitsByMonth}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Visit Categories Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Categories</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {visitsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
       
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Symptom Categories</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={symptomsByCategory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Occurrence Count" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="averageSeverity" name="Avg. Severity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Symptoms</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSymptoms}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Occurrence Count" fill="#8884d8" />
                    <Bar dataKey="averageSeverity" name="Avg. Severity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Insights</h2>
            
            {filteredVisits.length === 0 ? (
              <p className="text-gray-500">No data available for the selected time period.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-800">Visit Patterns</h3>
                  <p className="text-sm text-gray-600">
                    {visitsByMonth.length > 0 && visitsByMonth.some(m => m.visits > 0) ? (
                      `You had an average of ${(filteredVisits.length / Math.min(parseInt(timeRange), visitsByMonth.length)).toFixed(1)} visits per month in the selected period.`
                    ) : (
                      'Not enough data to analyze visit patterns.'
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-800">Common Health Issues</h3>
                  <p className="text-sm text-gray-600">
                    {visitsByCategory.length > 0 ? (
                      `Your most common health issue was "${visitsByCategory[0].name}" with ${visitsByCategory[0].value} occurrences.`
                    ) : (
                      'Not enough data to identify common health issues.'
                    )}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-800">Symptom Analysis</h3>
                  <p className="text-sm text-gray-600">
                    {topSymptoms.length > 0 ? (
                      `Your most frequently reported symptom was "${topSymptoms[0].name}" with an average severity of ${topSymptoms[0].averageSeverity}/10.`
                    ) : (
                      'Not enough symptom data for analysis.'
                    )}
                  </p>
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-gray-500 italic">
                    Note: These insights are based on your self-reported data and should not replace professional medical advice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;