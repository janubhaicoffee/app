"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductEditorForm from "../ProductEditorForm";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); setLoading(false); return; }

        const res = await fetch(`/api/admin/data?type=products`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (!res.ok) { setError("Failed to load"); setLoading(false); return; }

        const json = await res.json();
        const found = (json.data || []).find(p => p.id === params.id);
        if (!found) { setError("Product not found"); setLoading(false); return; }

        setProduct(found);
      } catch (e) {
        setError("Error loading product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-loading" style={{ color: "var(--accent-gold)" }}>{error}</div>;
  if (!product) return <div className="admin-loading">Product not found</div>;

  return <ProductEditorForm initialData={product} isNew={false} />;
}
