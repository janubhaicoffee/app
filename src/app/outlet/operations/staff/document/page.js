'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EmploymentDocument() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadStaff() {
      try {
        const { data, error } = await supabase
          .from('outlet_staff')
          .select('*, outlets(name, code)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setStaff(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <p>Loading document...</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: 'red' }}>
        <p>Error loading staff member: {error || 'Not found'}</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px',
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      color: '#333',
      lineHeight: '1.6',
      background: '#fff',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      minHeight: '100vh',
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #fff; }
          div { box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
        <button 
          onClick={() => window.print()}
          style={{
            background: '#ff6b00',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Letterhead Header */}
      <div style={{
        borderBottom: '2px solid #ff6b00',
        paddingBottom: '20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#ff6b00', fontSize: '28px', fontWeight: 800 }}>JANUBHAI COFFEE</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
            Outlet: {staff.outlets?.name || 'HQ'} {staff.outlets?.code ? `(${staff.outlets.code})` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
          <p style={{ margin: 0 }}>Date: {today}</p>
          <p style={{ margin: 0 }}>Ref: EMP/{staff.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '30px', fontSize: '20px' }}>
          EMPLOYMENT OFFER & APPOINTMENT LETTER
        </h2>
        
        <p>Dear <strong>{staff.display_name}</strong>,</p>
        
        <p>
          Welcome to the Janubhai Coffee family! We are pleased to offer you the position of <strong>{staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</strong> at our <strong>{staff.outlets?.name || 'Headquarters'}</strong> outlet.
        </p>

        <p>Below are the details of your employment:</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', width: '40%', fontWeight: 600 }}>Employee Name</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>{staff.display_name}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>Contact Number</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>{staff.phone || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>Email Address</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>{staff.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>Aadhaar Number</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>{staff.aadhaar_number || 'Pending'}</td>
            </tr>
            {staff.pan_number && (
              <tr>
                <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>PAN Number</td>
                <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>{staff.pan_number}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>Monthly Fixed Salary</td>
              <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>
                {staff.monthly_salary ? `₹${staff.monthly_salary}` : 'To be discussed'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 15px', background: '#f8fafc', fontWeight: 600 }}>Commission on Net Profit</td>
              <td style={{ padding: '10px 15px' }}>
                {staff.commission_on_profit ? 'Eligible (As per company policy)' : 'Not Eligible (Trial Period / Standard Contract)'}
              </td>
            </tr>
          </tbody>
        </table>

        <p><strong>Terms and Conditions:</strong></p>
        <ul style={{ paddingLeft: '20px', marginBottom: '40px' }}>
          <li style={{ marginBottom: '8px' }}>Your employment starts on the date of your first clock-in at the designated outlet.</li>
          <li style={{ marginBottom: '8px' }}>During the initial trial period, commission structures (if any) are typically on hold until the probationary period is successfully completed and mutually agreed upon.</li>
          <li style={{ marginBottom: '8px' }}>You are required to strictly follow the operational protocols, hygiene standards, and customer service guidelines of Janubhai Coffee.</li>
          <li style={{ marginBottom: '8px' }}>Any misuse of the POS system, inventory theft, or gross misconduct will lead to immediate termination and legal action if necessary.</li>
        </ul>

        <p>Please sign below to signify your acceptance of this offer and the terms and conditions outlined above.</p>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px' }}>
        <div style={{ width: '45%' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', height: '40px' }}></div>
          <p style={{ margin: 0, fontWeight: 600 }}>Authorized Signatory</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>For Janubhai Coffee</p>
        </div>
        <div style={{ width: '45%' }}>
          <div style={{ borderBottom: '1px solid #000', marginBottom: '10px', height: '40px' }}></div>
          <p style={{ margin: 0, fontWeight: 600 }}>Employee Signature</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Name: {staff.display_name}</p>
        </div>
      </div>

    </div>
  );
}
