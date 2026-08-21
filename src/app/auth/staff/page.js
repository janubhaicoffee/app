'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Phone,
  Coffee,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import './staff-auth.css';

export default function StaffAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password' | 'presets'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated with a staff role
    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        try {
          const res = await fetch('/api/auth/check-role', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          const data = await res.json();
          if (data.role && data.role !== 'customer' && data.role !== 'guest') {
            handleRouteByRole(data.role);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    checkExistingSession();
  }, []);

  const handleRouteByRole = (role) => {
    if (redirectPath) {
      router.push(redirectPath);
      return;
    }

    if (role === 'operations_head' || role === 'operations' || role === 'operation_manager') {
      router.push('/admin/operations');
    } else if (role === 'growth' || role === 'brand_leader') {
      router.push('/admin/growth');
    } else if (role === 'manager' || role === 'store_manager') {
      router.push('/admin/manager');
    } else if (role === 'superadmin' || role === 'owner') {
      router.push('/admin');
    } else {
      router.push('/admin/operations');
    }
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMethod === 'password') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Verify role
        const roleRes = await fetch('/api/auth/check-role', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        });
        const roleData = await roleRes.json();

        if (roleData.role === 'customer' || roleData.role === 'guest') {
          toast.error('This account is not registered as Janu Bhai Cafe operations staff.');
          await supabase.auth.signOut();
          return;
        }

        toast.success(`Welcome, ${roleData.staffName || 'Staff'}!`);
        handleRouteByRole(roleData.role);
      } else if (authMethod === 'otp') {
        if (!otpSent) {
          // Send OTP
          const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
          const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
          });

          if (error) throw error;

          toast.success('Staff verification OTP sent to your phone');
          setOtpSent(true);
        } else {
          // Verify OTP
          const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;
          const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms',
          });

          if (error) throw error;

          const roleRes = await fetch('/api/auth/check-role', {
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          });
          const roleData = await roleRes.json();

          if (roleData.role === 'customer' || roleData.role === 'guest') {
            toast.error('This number is not registered under Janu Bhai Cafe staff.');
            await supabase.auth.signOut();
            return;
          }

          toast.success(`Welcome, ${roleData.staffName || 'Staff'}!`);
          handleRouteByRole(roleData.role);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Staff authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetEmail, presetRole) => {
    setEmail(presetEmail);
    setAuthMethod('password');
    toast.success(`Selected ${presetRole}. Please enter your staff password.`);
  };

  return (
    <div className="staff-auth-container">
      <div className="staff-auth-card">
        <div style={{ textAlign: 'center' }}>
          <span className="staff-auth-badge">
            <ShieldCheck size={14} /> Janu Bhai Cafe · Staff Barrier
          </span>
          <h1 className="staff-auth-title">Operations Command Login</h1>
          <p className="staff-auth-desc">
            Secure role-based authentication for Operations Head, Growth Lead, and Store Managers.
          </p>
        </div>

        {/* Auth Method Tabs */}
        <div className="staff-auth-tabs">
          <button
            className={`staff-tab-btn ${authMethod === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setAuthMethod('otp');
              setOtpSent(false);
            }}
          >
            <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Mobile OTP
          </button>
          <button
            className={`staff-tab-btn ${authMethod === 'password' ? 'active' : ''}`}
            onClick={() => setAuthMethod('password')}
          >
            <KeyRound size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email & Password
          </button>
        </div>

        <form onSubmit={handleStaffLogin}>
            {authMethod === 'password' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                    Staff Official Email *
                  </label>
                  <input
                    type="email"
                    className="staff-input"
                    placeholder="e.g. staff@janubhai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                    Password / Access Code *
                  </label>
                  <input
                    type="password"
                    className="staff-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {!otpSent ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                      Registered Staff Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="staff-input"
                      placeholder="e.g. 9910778576 or 8527976791"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#d4a359', marginBottom: '4px' }}>
                      Enter 6-Digit SMS OTP *
                    </label>
                    <input
                      type="text"
                      className="staff-input"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="staff-submit-btn" disabled={loading}>
              <Lock size={16} />
              <span>
                {loading
                  ? 'Verifying Permissions...'
                  : authMethod === 'otp' && !otpSent
                  ? 'Send Verification OTP'
                  : 'Access Staff Dashboard'}
              </span>
            </button>
          </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <Link href="/" style={{ color: '#a89f91', fontSize: '0.82rem', textDecoration: 'underline' }}>
            ← Return to Janu Bhai Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
