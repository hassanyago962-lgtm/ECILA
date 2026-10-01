'use client';

import { useState } from 'react';

interface ChatResults {
  perfectAnswer?: string;
  answers?: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  };
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ChatResults | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setResults({ error: 'Failed to communicate with the orchestrator engine.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1f2937' }}>
      <header style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: '#111827', letterSpacing: '-0.025em' }}>ECILA AI Workspace</h1>
        <p style={{ color: '#4b5563', marginTop: '0.5rem', fontSize: '1.1rem' }}>Multi-Provider AI Orchestrator & Synthesis Node</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a question to evaluate across OpenAI, Claude, and Gemini..."
          style={{ flex: 1, padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '1.1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: '1rem 2rem', borderRadius: '10px', border: 'none', background: loading ? '#9ca3af' : '#2563eb', color: '#fff', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
        >
          {loading ? 'Orchestrating...' : 'Analyze'}
        </button>
      </form>

      {results?.error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px', color: '#991b1b', marginBottom: '2rem' }}>
          {results.error}
        </div>
      )}

      {results && !results.error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <section style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2rem', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#0369a1', marginTop: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎯 Perfect Orchestrated Answer</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.1rem' }}>{results.perfectAnswer}</div>
          </section>

          <div>
            <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: 600, color: '#374151' }}>Raw Provider Comparisons</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div style={{ border: '1px solid #e5e7eb', padding: '1.25rem', borderRadius: '10px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#059669', fontSize: '1.1rem', fontWeight: 600 }}>OpenAI GPT Model</h4>
                <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563' }}>{results.answers?.openai}</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', padding: '1.25rem', borderRadius: '10px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#d97706', fontSize: '1.1rem', fontWeight: 600 }}>Anthropic Claude</h4>
                <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563' }}>{results.answers?.anthropic}</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', padding: '1.25rem', borderRadius: '10px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#4f46e5', fontSize: '1.1rem', fontWeight: 600 }}>Google Gemini</h4>
                <div style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563' }}>{results.answers?.gemini}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
