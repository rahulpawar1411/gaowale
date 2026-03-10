import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';

const CARD_CONFIG = [
  { key: 'totalUsers', label: 'Total Users', color: '#2563eb' },
  { key: 'members', label: 'Members', color: '#16a34a' },
  { key: 'farmers', label: 'Farmers', color: '#ca8a04' },
  { key: 'lakhpatiDidi', label: 'Lakhpati Didi', color: '#9333ea' },
  { key: 'customers', label: 'Customers', color: '#0891b2' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardApi.getStats();
        if (cancelled) return;
        if (res.success) setStats(res.data);
        else setError(res.message || 'Failed to load dashboard');
      } catch (e) {
        if (!cancelled) setError(e.message || 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Welcome to the Admin Panel</h1>
      <p style={styles.subtitle}>
        Select a table from the sidebar to view or manage data.
      </p>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {loading ? (
        <p style={styles.muted}>Loading dashboard…</p>
      ) : stats ? (
        <div style={styles.cards}>
          {CARD_CONFIG.map(({ key, label, color }) => (
            <div key={key} style={{ ...styles.card, borderTopColor: color }}>
              <div style={styles.cardLabel}>{label}</div>
              <div style={styles.cardValue}>{stats[key] ?? 0}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1f2937',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#6b7280',
  },
  error: {
    padding: '0.75rem 1rem',
    borderRadius: 8,
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  muted: {
    margin: '1rem 0 0',
    color: '#6b7280',
  },
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.25rem',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  card: {
    minWidth: 160,
    padding: '1.25rem 1.5rem',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderTop: '4px solid #2563eb',
  },
  cardLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '0.35rem',
  },
  cardValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#111827',
  },
};
