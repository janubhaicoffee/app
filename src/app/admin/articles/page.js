"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({ id: '', title: '', slug: '', content: '', meta_title: '', meta_description: '', published: false });

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data?type=articles", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setArticles(json.data || []);
      }
    } catch (e) {
      console.error(e);
    }
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

  const openModal = (article) => {
    setEditingArticle(article);
    setFormData({ 
      id: article.id, 
      title: article.title || '', 
      slug: article.slug || '', 
      content: article.content || '', 
      meta_title: article.meta_title || '', 
      meta_description: article.meta_description || '',
      published: !!article.published
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        published: formData.published
      };

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "update_article",
          id: editingArticle.id,
          payload
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchArticles();
      } else {
        alert("Failed to update article.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating article.");
    }
  };

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
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => openModal(article)}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', padding: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>Edit Article</h2>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label>Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Slug (URL Path)</label>
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
              </div>
              
              <div>
                <label>Content (Markdown)</label>
                <textarea 
                  required 
                  rows="15" 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px', fontFamily: 'monospace', fontSize: '14px' }}
                ></textarea>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>SEO Title</label>
                    <input type="text" value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                    <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} id="published" />
                    <label htmlFor="published" style={{ margin: 0 }}>Published (Visible to public)</label>
                  </div>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <label>SEO Description</label>
                  <textarea rows="2" value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }}></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="admin-btn" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="admin-btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
