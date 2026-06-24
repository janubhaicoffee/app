"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (data) setArticles(data);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ topic })
      });
      
      const data = await res.json();
      if (data.success) {
        setTopic("");
        fetchArticles();
        alert("Article generated and saved successfully!");
      } else {
        alert("Error generating article: " + data.error);
      }
    } catch (error) {
      alert("Failed to connect to AI service.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <div className="admin-header">
        <h1>SEO Articles (AI Generated)</h1>
      </div>

      <div className="admin-card" style={{ background: 'rgba(183, 28, 28, 0.05)', borderColor: 'var(--accent-red)' }}>
        <h3 style={{ color: 'var(--accent-red)', marginTop: 0 }}>NVIDIA MiniMax-M3 AI Generator</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Enter a topic related to coffee, wholesale, or Chikmagalur. The AI will write a complete, SEO-optimized markdown article tailored to the Janu Bhai Coffee brand.
        </p>
        
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Why Chikmagalur is the Coffee Capital of India"
            style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
            required
            disabled={isGenerating}
          />
          <button type="submit" className="admin-btn" disabled={isGenerating} style={{ background: 'var(--accent-red)' }}>
            {isGenerating ? "Generating (Wait ~10s)..." : "Generate Article ⚡"}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found. Generate one above.</td></tr>
            ) : (
              articles.map(article => (
                <tr key={article.id}>
                  <td style={{ fontWeight: 600 }}>{article.title}</td>
                  <td>/{article.slug}</td>
                  <td>{new Date(article.created_at).toLocaleDateString()}</td>
                  <td>{article.published ? "Published" : "Draft"}</td>
                  <td>
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
