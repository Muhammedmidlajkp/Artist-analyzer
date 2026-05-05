import { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, Trophy, Award, Star, Search } from 'lucide-react';
import { fetchDashboardData } from '../services/api';

export default function ReferralTracking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const resp = await fetchDashboardData();
        if (resp.status === 'success') {
          setData(resp.data);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const referralData = useMemo(() => {
    const refs = data.filter(d => d.source === 'Reference' && d.referredBy);
    const partnerMap = {};

    refs.forEach(d => {
      const name = d.referredBy.trim();
      if (!partnerMap[name]) {
        partnerMap[name] = {
          name,
          count: 0,
          revenue: 0,
          brides: [],
          lastReferral: null
        };
      }
      partnerMap[name].count++;
      partnerMap[name].revenue += (Number(d.totalRevenue) || 0);
      partnerMap[name].brides.push({
        name: d.brideName,
        date: d.eventDate,
        revenue: d.totalRevenue
      });

      if (!partnerMap[name].lastReferral || d.eventDate > partnerMap[name].lastReferral) {
        partnerMap[name].lastReferral = d.eventDate;
      }
    });

    const partners = Object.values(partnerMap);

    // Categories
    return {
      elite: partners.filter(p => p.count > 15).sort((a, b) => b.count - a.count),
      super: partners.filter(p => p.count >= 6 && p.count <= 15).sort((a, b) => b.count - a.count),
      active: partners.filter(p => p.count >= 1 && p.count <= 5).sort((a, b) => b.count - a.count),
      all: partners
    };
  }, [data]);

  const filteredPartners = useMemo(() => {
    if (!searchTerm) return referralData;
    const searchLower = searchTerm.toLowerCase();
    const filterFn = p => p.name.toLowerCase().includes(searchLower);

    return {
      elite: referralData.elite.filter(filterFn),
      super: referralData.super.filter(filterFn),
      active: referralData.active.filter(filterFn),
      all: referralData.all.filter(filterFn)
    };
  }, [referralData, searchTerm]);

  if (loading) return (
    <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  );

  const CategoryHeading = ({ title, icon, count, color }) => (
    <div className="flex items-center justify-between mb-4 mt-8">
      <div className="flex items-center gap-2">
        <div style={{ padding: '0.5rem', backgroundColor: `${color}15`, color: color, borderRadius: '8px' }}>
          {icon}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px' }}>
          {count} Members
        </span>
      </div>
    </div>
  );

  const PartnerCard = ({ partner, badgeClass }) => (
    <div className="partner-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>{partner.name}</h4>
          <span className={badgeClass}>
            {partner.count > 15 ? 'Platinum Partner' : partner.count >= 6 ? 'Gold Member' : 'Active Member'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{partner.count}</div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Referrals</div>
        </div>
      </div>

      <div className="grid-2 mb-4" style={{ gap: '0.5rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total Value</div>
          <div style={{ fontWeight: 700 }}>₹{partner.revenue.toLocaleString()}</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Success Rate</div>
          <div style={{ fontWeight: 700 }}>100%</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} /> Recent Referrals
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {partner.brides.slice(0, 3).map((bride, i) => (
            <span key={i} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
              {bride.name}
            </span>
          ))}
          {partner.brides.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{partner.brides.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ padding: '0' }}>
      <div className="page-header flex justify-between items-end mb-8">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Award size={20} />
            User Referral Tracking
          </div>
          <h1 className="page-title">Client References</h1>
          <p className="page-subtitle">Track and categorize customers who refer new brides to your business.</p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', borderRadius: '12px' }}
            placeholder="Search partner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3 mb-8">
        <div className="card flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 100%)' }}>
          <div style={{ padding: '1rem', background: '#3b82f6', color: 'white', borderRadius: '12px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Referrals</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{referralData.all.reduce((acc, p) => acc + p.count, 0)}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 100%)' }}>
          <div style={{ padding: '1rem', background: '#10b981', color: 'white', borderRadius: '12px' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Elite Partners</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{referralData.elite.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 100%)' }}>
          <div style={{ padding: '1rem', background: '#8b5cf6', color: 'white', borderRadius: '12px' }}>
            <Star size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Partner Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{referralData.all.reduce((acc, p) => acc + p.revenue, 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Elite Category */}
      {filteredPartners.elite.length > 0 && (
        <div className="category-section" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <CategoryHeading title="Elite Partners" icon={<Trophy size={20} />} count={filteredPartners.elite.length} color="#8b5cf6" />
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {filteredPartners.elite.map(p => (
              <PartnerCard key={p.name} partner={p} badgeClass="badge-elite" />
            ))}
          </div>
        </div>
      )}

      {/* Super Category */}
      {filteredPartners.super.length > 0 && (
        <div className="category-section" style={{ borderLeft: '4px solid #f59e0b' }}>
          <CategoryHeading title="Super Referrers" icon={<Award size={20} />} count={filteredPartners.super.length} color="#f59e0b" />
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {filteredPartners.super.map(p => (
              <PartnerCard key={p.name} partner={p} badgeClass="badge-gold" />
            ))}
          </div>
        </div>
      )}

      {/* Active Category */}
      {filteredPartners.active.length > 0 && (
        <div className="category-section" style={{ borderLeft: '4px solid #94a3b8' }}>
          <CategoryHeading title="Active Referrers" icon={<Star size={20} />} count={filteredPartners.active.length} color="#94a3b8" />
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {filteredPartners.active.map(p => (
              <PartnerCard key={p.name} partner={p} badgeClass="badge-silver" />
            ))}
          </div>
        </div>
      )}

      {!filteredPartners.all.length && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.3 }} />
          <h3>No referral partners found</h3>
          <p className="text-secondary">Try searching for a different name or add new data with references.</p>
        </div>
      )}
    </div>
  );
}
