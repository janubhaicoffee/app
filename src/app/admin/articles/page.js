"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({ id: '', title: '', slug: '', content: '', meta_title: '', meta_description: '', published: false });
  
  // AI Tools State
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isAiEditing, setIsAiEditing] = useState(false);

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
    setImagePrompt("");
    setGeneratedImageUrl(null);
    setPreviewMode(false);
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
        const errData = await res.json();
        alert("Failed to update article: " + (errData.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Error updating article.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action: "delete_article", id })
      });
      if (res.ok) {
        fetchArticles();
      } else {
        const err = await res.json();
        alert("Failed to delete article: " + (err.error || ""));
      }
    } catch (e) {
      alert("Error deleting article");
    }
  };

  // Editor Tools
  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('markdown-editor');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setFormData({...formData, content: newText});
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) return alert("Please enter an image prompt.");
    setGeneratingImage(true);
    setGeneratedImageUrl(null);
    const encodedPrompt = encodeURIComponent(imagePrompt.trim() + " premium quality photography coffee aesthetic");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&width=800&height=500`;
    
    const img = new window.Image();
    img.onload = () => {
      setGeneratingImage(false);
      setGeneratedImageUrl(imageUrl);
    };
    img.onerror = () => {
      setGeneratingImage(false);
      alert("Failed to generate image.");
    };
    img.src = imageUrl;
  };

  const handleInsertImage = () => {
    if (!generatedImageUrl) return;
    insertMarkdown(`\n![${imagePrompt}](${generatedImageUrl})\n\n`);
    setGeneratedImageUrl(null);
    setImagePrompt("");
  };

  const handleAITextEdit = async (action) => {
    if (!formData.content.trim()) return alert("Content is empty.");
    setIsAiEditing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/ai/edit-article", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, content: formData.content })
      });
      if (res.ok) {
        const json = await res.json();
        setFormData({...formData, content: json.content});
      } else {
        alert("AI editing failed. Check API keys.");
      }
    } catch (e) {
      alert("Error connecting to AI service.");
    } finally {
      setIsAiEditing(false);
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
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginRight: '0.5rem' }} onClick={() => openModal(article)}>Edit</button>
                    <button className="admin-btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', marginRight: '0.5rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={() => handleDelete(article.id)}>Delete</button>
                    {article.published && (
                      <a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer">
                        <button className="admin-btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>View Live</button>
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '900px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', padding: '2rem' }}>
            <h2 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
              Edit Article
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => handleAITextEdit('polish')} disabled={isAiEditing} style={{ background: 'var(--accent-gold)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>{isAiEditing ? "Processing..." : "✨ Polish Text"}</button>
                <button type="button" onClick={() => handleAITextEdit('expand')} disabled={isAiEditing} style={{ background: 'var(--accent-red)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>{isAiEditing ? "Processing..." : "✨ Expand Section"}</button>
              </div>
            </h2>
            
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

              {/* AI Image Generator Section */}
              <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <label style={{ color: 'var(--accent-red)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>🎨 AI Image Generator</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="e.g. A steaming cup of coffee in a cozy cafe..."
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    disabled={generatingImage}
                  />
                  <button type="button" onClick={handleGenerateImage} disabled={generatingImage} style={{ background: 'var(--text-primary)', color: '#fff', border: 'none', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    {generatingImage ? "Generating..." : "Generate Image"}
                  </button>
                </div>
                {generatedImageUrl && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Generated Image Preview:</p>
                    <img src={generatedImageUrl} alt="Generated Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button type="button" onClick={handleInsertImage} style={{ display: 'block', margin: '1rem auto 0', background: 'var(--accent-red)', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      ✨ Insert into Article
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span>Content (Markdown)</span>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                      <button type="button" onClick={() => setPreviewMode(false)} style={{ padding: '4px 12px', border: 'none', background: !previewMode ? 'var(--accent-red)' : 'transparent', color: !previewMode ? '#fff' : '#333', cursor: 'pointer' }}>Write</button>
                      <button type="button" onClick={() => setPreviewMode(true)} style={{ padding: '4px 12px', border: 'none', background: previewMode ? 'var(--accent-red)' : 'transparent', color: previewMode ? '#fff' : '#333', cursor: 'pointer' }}>Preview</button>
                    </div>
                    {!previewMode && (
                      <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '4px' }}>
                        <button type="button" onClick={() => insertMarkdown('**', '**')} title="Bold" style={{ padding: '2px 6px', cursor: 'pointer' }}>B</button>
                        <button type="button" onClick={() => insertMarkdown('_', '_')} title="Italic" style={{ padding: '2px 6px', cursor: 'pointer' }}>I</button>
                        <button type="button" onClick={() => insertMarkdown('## ', '')} title="Heading 2" style={{ padding: '2px 6px', cursor: 'pointer' }}>H2</button>
                        <button type="button" onClick={() => insertMarkdown('- ', '')} title="Bullet List" style={{ padding: '2px 6px', cursor: 'pointer' }}>•</button>
                        <button type="button" onClick={() => insertMarkdown('[', '](url)')} title="Link" style={{ padding: '2px 6px', cursor: 'pointer' }}>🔗</button>
                      </div>
                    )}
                  </div>
                </label>
                {previewMode ? (
                  <div className="markdown-preview" style={{ width: '100%', minHeight: '320px', maxHeight: '500px', padding: '16px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px', background: '#fcfcfc', overflowY: 'auto', fontFamily: 'sans-serif' }}>
                    <ReactMarkdown>{formData.content || "*Nothing to preview*"}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea 
                    id="markdown-editor"
                    required 
                    rows="15" 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    style={{ width: '100%', padding: '8px', marginTop: '5px', fontFamily: 'monospace', fontSize: '14px' }}
                  ></textarea>
                )}
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
