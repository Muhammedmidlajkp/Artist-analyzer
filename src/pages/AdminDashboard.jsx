import { useState, useEffect, useMemo } from 'react';
import { fetchDashboardData } from '../services/api';
import { Loader2, IndianRupee, Users, Target, UserCheck } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

// Helper for dates based on mock/real data formats
const parseDate = (d) => new Date(d);

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [timeFilter, setTimeFilter] = useState('All'); // Day, Week, Month, Year, All
  const [artistFilter, setArtistFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resp = await fetchDashboardData();
      if (resp.status === 'success') setData(resp.data);
      else setError(resp.message || 'Failed to fetch data.');
    } catch (err) {
      setError(err.message || 'Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  // Unique lists for Dropdowns
  const artists = useMemo(() => ['All', ...new Set(data.map(d => d.artist).filter(Boolean))], [data]);
  const sources = useMemo(() => ['All', ...new Set(data.map(d => d.source).filter(Boolean))], [data]);

  // Apply Filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      let pass = true;
      if (artistFilter !== 'All' && row.artist !== artistFilter) pass = false;
      if (sourceFilter !== 'All' && row.source !== sourceFilter) pass = false;
      
      // Basic time filtering logic based on proximity to "today"
      if (timeFilter !== 'All' && row.eventDate) {
         const rowDate = parseDate(row.eventDate);
         const now = new Date();
         const diffTime = Math.abs(now - rowDate);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         
         if (timeFilter === 'Day' && diffDays > 1) pass = false;
         if (timeFilter === 'Week' && diffDays > 7) pass = false;
         if (timeFilter === 'Month' && diffDays > 30) pass = false;
         if (timeFilter === 'Year' && diffDays > 365) pass = false;
      }
      
      return pass;
    });
  }, [data, timeFilter, artistFilter, sourceFilter]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalRev = filteredData.reduce((acc, curr) => acc + (Number(curr.totalRevenue) || 0), 0);
    const totalLeads = filteredData.length;
    
    // Simulate conversion (if we assume each entry is a converted lead, maybe we compare against a fake metric or total = 100%)
    // Since we only have converted entries in this DB, Conversion Rate might just be 100% or calculated differently if there were failures.
    // We'll show standard 100% for entries in the db, or mock a 45% based on 'leads vs booked' if data supported it.
    // For now, let's keep it static visual per prompt constraints since no 'lead vs booked' status exists.
    const conversionRate = totalLeads > 0 ? "100%" : "0%"; 

    // Top artist calculation
    const artistScores = {};
    filteredData.forEach(d => {
      if (!d.artist) return;
      artistScores[d.artist] = (artistScores[d.artist] || 0) + (Number(d.totalRevenue) || 0);
    });
    
    let topArtist = 'N/A';
    let maxRev = 0;
    Object.keys(artistScores).forEach(a => {
      if (artistScores[a] > maxRev) { maxRev = artistScores[a]; topArtist = a; }
    });

    return { totalRev, totalLeads, conversionRate, topArtist };
  }, [filteredData]);

  // Chart Data: Revenue Over Time
  const revChartData = useMemo(() => {
    // Group by Date
    const grouped = {};
    filteredData.forEach(d => {
      if (!d.eventDate) return;
      grouped[d.eventDate] = (grouped[d.eventDate] || 0) + (Number(d.totalRevenue) || 0);
    });
    const sortedKeys = Object.keys(grouped).sort((a,b) => parseDate(a) - parseDate(b));
    
    return {
      labels: sortedKeys,
      datasets: [{
        label: 'Revenue',
        data: sortedKeys.map(k => grouped[k]),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }, [filteredData]);

  // Chart Data: Artist Performance
  const artistChartData = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!d.artist) return;
      grouped[d.artist] = (grouped[d.artist] || 0) + (Number(d.totalRevenue) || 0);
    });
    return {
      labels: Object.keys(grouped),
      datasets: [{
        label: 'Revenue by Artist',
        data: Object.values(grouped),
        backgroundColor: '#8b5cf6',
        borderRadius: 4
      }]
    };
  }, [filteredData]);

  // Chart Data: Satisfaction Overview
  const satisfactionChartData = useMemo(() => {
    const counts = { 'Satisfied': 0, 'Neutral': 0, 'Not Satisfied': 0 };
    filteredData.forEach(d => {
      if (d.satisfaction && counts.hasOwnProperty(d.satisfaction)) {
        counts[d.satisfaction]++;
      }
    });
    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverOffset: 4
      }]
    };
  }, [filteredData]);

  // Chart Data: Source Distribution
  const sourceChartData = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!d.source) return;
      grouped[d.source] = (grouped[d.source] || 0) + 1;
    });
    return {
      labels: Object.keys(grouped),
      datasets: [{
        label: 'Sources',
        data: Object.values(grouped),
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6']
      }]
    };
  }, [filteredData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '60vh', color: 'var(--text-muted)' }}>
        <Loader2 className="spinner" size={24} style={{ marginRight: '0.5rem' }} /> Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Track your revenue, artist performance, and lead sources.</p>
        </div>

        <div className="flex gap-2">
          <select className="form-select" value={timeFilter} onChange={e => setTimeFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="All">All Time</option>
            <option value="Year">Past Year</option>
            <option value="Month">Past Month</option>
            <option value="Week">Past Week</option>
            <option value="Day">Past Day</option>
          </select>
          <select className="form-select" value={artistFilter} onChange={e => setArtistFilter(e.target.value)} style={{ width: 'auto' }}>
            {artists.map(a => <option key={a} value={a}>{a === 'All' ? 'All Artists' : a}</option>)}
          </select>
          <select className="form-select" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ width: 'auto' }}>
            {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-danger mb-6" style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)' }}>{error}</div>
      ) : null}

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        <div className="card flex items-center justify-between">
          <div>
            <div className="text-secondary mb-1" style={{ fontSize: '0.875rem' }}>Total Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{kpis.totalRev.toLocaleString()}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-md)' }}>
            <IndianRupee size={24} />
          </div>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <div className="text-secondary mb-1" style={{ fontSize: '0.875rem' }}>Total Leads</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpis.totalLeads}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
            <Users size={24} />
          </div>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <div className="text-secondary mb-1" style={{ fontSize: '0.875rem' }}>Conversion Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpis.conversionRate}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: 'var(--radius-md)' }}>
            <Target size={24} />
          </div>
        </div>
        <div className="card flex items-center justify-between">
          <div>
            <div className="text-secondary mb-1" style={{ fontSize: '0.875rem' }}>Top Artist</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{kpis.topArtist}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-md)' }}>
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Charts Layer 1 */}
      <div className="grid-2 mb-6" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <div className="card">
          <h3 className="mb-4">Revenue Over Time</h3>
          <div style={{ height: '300px' }}>
            <Line data={revChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="mb-4">Satisfaction Overview</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={satisfactionChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Charts Layer 2 */}
      <div className="grid-2 mb-6">
        <div className="card">
          <h3 className="mb-4">Artist Performance</h3>
          <div style={{ height: '300px' }}>
            <Bar data={artistChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h3 className="mb-4">Source Distribution</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={sourceChartData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
