'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Grid,
  List,
  Upload,
  Trash2,
  Copy,
  Check,
  X,
  Image,
  FileVideo,
  FileText,
  Folder,
} from 'lucide-react';

function getFileTypeIcon(type) {
  if (!type || type.startsWith('image')) return <Image size={20} />;
  if (type.startsWith('video')) return <FileVideo size={20} />;
  return <FileText size={20} />;
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function inferType(url, declaredType) {
  if (declaredType && declaredType !== 'unknown') return declaredType;
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'].includes(ext)) return 'document';
  return 'image';
}

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('image');
  const [fileFolder, setFileFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data?type=media', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMedia(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load media', err);
      showToast('Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  }

  const folders = useMemo(() => {
    const f = [...new Set(media.map((m) => m.folder || 'uncategorized').filter(Boolean))];
    return ['all', ...f.sort()];
  }, [media]);

  const types = useMemo(() => {
    const t = [...new Set(media.map((m) => inferType(m.url, m.type)))];
    return ['all', ...t.sort()];
  }, [media]);

  const filteredMedia = useMemo(() => {
    return media.filter((m) => {
      const inferredType = inferType(m.url, m.type);
      if (typeFilter !== 'all' && inferredType !== typeFilter) return false;
      if (folderFilter !== 'all' && (m.folder || 'uncategorized') !== folderFilter) return false;
      return true;
    });
  }, [media, typeFilter, folderFilter]);

  const handleUpload = async () => {
    if (!url.trim()) return;
    setUploading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const inferred = inferType(url, fileType);
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_media',
          payload: {
            url: url.trim(),
            name: fileName.trim() || url.split('/').pop()?.split('?')[0] || 'Untitled',
            type: inferred,
            folder: fileFolder.trim() || null,
            size: 0,
            width: null,
            height: null,
          },
        }),
      });
      if (res.ok) {
        showToast('Media added successfully');
        setShowUploadModal(false);
        setUrl('');
        setFileName('');
        setFileType('image');
        setFileFolder('');
        fetchMedia();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add media', 'error');
      }
    } catch (e) {
      showToast('Error adding media', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirmDelete || confirmDelete.id !== item.id) {
      setConfirmDelete(item);
      return;
    }
    setDeleting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete_media', id: item.id }),
      });
      if (res.ok) {
        showToast('Media deleted');
        fetchMedia();
      } else {
        showToast('Failed to delete media', 'error');
      }
    } catch (e) {
      showToast('Error deleting media', 'error');
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const copyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  return (
    <div className="admin-media-page">
      {toast && (
        <div className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>Media Library</h1>
        <button className="admin-btn" onClick={() => setShowUploadModal(true)}>
          <Upload size={16} /> Add Media
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          {types.map((t) => (
            <button
              key={t}
              className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          style={{
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            background: '#fff',
          }}
        >
          {folders.map((f) => (
            <option key={f} value={f}>
              {f === 'all' ? 'All Folders' : f}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {filteredMedia.length} file{filteredMedia.length !== 1 ? 's' : ''}
        </span>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <button
            className={`admin-btn-sm ${viewMode === 'grid' ? 'active-view' : ''}`}
            onClick={() => setViewMode('grid')}
            style={{
              borderRadius: 0,
              border: 'none',
              background: viewMode === 'grid' ? 'var(--primary-color)' : '#fff',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <Grid size={14} />
          </button>
          <button
            className={`admin-btn-sm ${viewMode === 'list' ? 'active-view' : ''}`}
            onClick={() => setViewMode('list')}
            style={{
              borderRadius: 0,
              border: 'none',
              background: viewMode === 'list' ? 'var(--primary-color)' : '#fff',
              color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div> Loading media...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <Image size={48} />
            <h3>No media files found</h3>
            <p>
              {media.length === 0
                ? 'Add your first media file to get started.'
                : 'No files match your filters.'}
            </p>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="media-grid">
          {filteredMedia.map((item) => {
            const inferredType = inferType(item.url, item.type);
            const isImage = inferredType === 'image';
            const isVideo = inferredType === 'video';
            return (
              <div key={item.id} className="media-grid-item">
                <div className="media-thumb">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.name || ''}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML =
                          '<div class=\"media-fallback\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg></div>';
                      }}
                    />
                  ) : isVideo ? (
                    <div className="media-fallback">
                      <FileVideo size={28} />
                    </div>
                  ) : (
                    <div className="media-fallback">
                      <FileText size={28} />
                    </div>
                  )}
                  <div className="media-actions-overlay">
                    <button
                      className="media-action-btn"
                      title="Copy URL"
                      onClick={() => copyUrl(item)}
                    >
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      className="media-action-btn media-action-btn-danger"
                      title="Delete"
                      onClick={() => handleDelete(item)}
                    >
                      {confirmDelete?.id === item.id ? '?' : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <div className="media-info">
                  <p className="media-name" title={item.name || 'Untitled'}>
                    {item.name || 'Untitled'}
                  </p>
                  <p className="media-meta">
                    {formatFileSize(item.size)} · {inferredType}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Dimensions</th>
                <th>Folder</th>
                <th>Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((item) => {
                const inferredType = inferType(item.url, item.type);
                const dims = item.width && item.height ? `${item.width}×${item.height}` : '—';
                return (
                  <tr key={item.id}>
                    <td style={{ width: 40 }}>
                      <div className="media-list-thumb">
                        {inferredType === 'image' ? (
                          <img
                            src={item.url}
                            alt=""
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          getFileTypeIcon(inferredType)
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.name || 'Untitled'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{inferredType}</td>
                    <td>{formatFileSize(item.size)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{dims}</td>
                    <td>{item.folder || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="admin-btn-sm-icon"
                          title="Copy URL"
                          onClick={() => copyUrl(item)}
                        >
                          {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button
                          className={`admin-btn-sm-icon ${confirmDelete?.id === item.id ? 'btn-confirming' : ''}`}
                          title="Delete"
                          onClick={() => handleDelete(item)}
                        >
                          {confirmDelete?.id === item.id ? 'Sure?' : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Media from URL</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>File URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>File Name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Auto-detected if empty"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Folder</label>
                <input
                  type="text"
                  value={fileFolder}
                  onChange={(e) => setFileFolder(e.target.value)}
                  placeholder="e.g. products, banners, blog"
                />
                <span className="form-hint">Organize media into folders (optional)</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="admin-btn-outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button
                className="admin-btn"
                onClick={handleUpload}
                disabled={uploading || !url.trim()}
              >
                {uploading ? 'Adding...' : 'Add Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .admin-media-page {
          position: relative;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }
        .media-grid-item {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }
        .media-grid-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .media-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          background: #f5f0eb;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .media-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bbb;
          width: 100%;
          height: 100%;
        }
        .media-actions-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .media-grid-item:hover .media-actions-overlay {
          opacity: 1;
        }
        .media-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .media-action-btn:hover {
          background: #fff;
          transform: scale(1.1);
        }
        .media-action-btn-danger:hover {
          background: #c62828;
          color: #fff;
        }
        .media-info {
          padding: 0.6rem 0.75rem;
        }
        .media-name {
          margin: 0 0 0.2rem;
          font-size: 0.82rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .media-meta {
          margin: 0;
          font-size: 0.72rem;
          color: var(--text-secondary);
        }
        .media-list-thumb {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          overflow: hidden;
          background: #f5f0eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .media-list-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-list-thumb svg {
          color: #bbb;
        }
        .admin-btn-sm-icon {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--text-secondary);
        }
        .admin-btn-sm-icon:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        .btn-confirming {
          background: #c62828 !important;
          color: #fff !important;
          border-color: #c62828 !important;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .active-view {
          background: var(--primary-color) !important;
          color: #fff !important;
          border-color: var(--primary-color) !important;
        }
      `}</style>
    </div>
  );
}
