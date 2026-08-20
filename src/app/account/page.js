'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Coffee,
  LogOut,
  CheckCircle2,
  Settings,
  Award,
  Compass,
  Calendar,
  Zap,
  AlertTriangle,
  Key,
  ShieldCheck,
  Sparkles,
  Truck,
  ArrowRight,
  Clock,
  Check,
  X,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { getUserProgression, awardPoints } from '@/actions/progression';
import { getTierInfo } from '@/lib/progressionUtils';
import { optimizeDeliverySchedule } from '@/actions/schedule';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './account.css';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);

  // Progression & Lore State
  const [progressionData, setProgressionData] = useState({
    profile: { total_points: 0 },
    ledger: [],
  });

  // Scheduling Optimizer Form State
  const [agendaForm, setAgendaForm] = useState({
    busyDays: ['Monday', 'Wednesday'],
    peakHours: '14:00',
    sleepHours: 7,
  });
  const [optimizationMatrix, setOptimizationMatrix] = useState(null);
  const [optimizing, setOptimizing] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    pincode: '',
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Phone Verification State
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneStep, setPhoneStep] = useState('input'); // 'input' | 'otp'
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');

  // Subscription Plan State
  const [selectedSubFrequency, setSelectedSubFrequency] = useState('4weeks');
  const [selectedSubPack, setSelectedSubPack] = useState('100g');

  const router = useRouter();

  // Auto-award points for linked identities on load
  useEffect(() => {
    if (user && progressionData && sessionToken) {
      const checkAndAwardIdentityPoints = async () => {
        const hasGoogle = user.identities?.some((id) => id.provider === 'google');
        const hasFacebook = user.identities?.some((id) => id.provider === 'facebook');
        const hasPhone = !!user.phone;

        const ledger = progressionData.ledger || [];
        let shouldReload = false;

        if (hasGoogle && !ledger.some((l) => l.action_type === 'Link Google Account')) {
          await awardPoints(sessionToken, 50, 'Link Google Account');
          shouldReload = true;
        }

        if (hasFacebook && !ledger.some((l) => l.action_type === 'Link Facebook Account')) {
          await awardPoints(sessionToken, 50, 'Link Facebook Account');
          shouldReload = true;
        }

        if (hasPhone && !ledger.some((l) => l.action_type === 'Verify Phone')) {
          await awardPoints(sessionToken, 100, 'Verify Phone');
          shouldReload = true;
        }

        if (shouldReload) {
          const progRes = await getUserProgression(sessionToken);
          if (progRes.success) {
            setProgressionData({ profile: progRes.profile, ledger: progRes.ledger });
          }
        }
      };
      checkAndAwardIdentityPoints();
    }
  }, [user, progressionData, sessionToken]);

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (session) => {
      try {
        if (!session) {
          router.push('/auth/unified');
          return;
        }

        setUser(session.user);
        setSessionToken(session.access_token);
        setLoading(false);

        // Fetch Profile for Address
        const { data: profile } = await supabase
          .from('profiles')
          .select('address, city, pincode')
          .eq('id', session.user.id)
          .single();

        if (profile && mounted) {
          setAddressForm({
            address: profile.address || '',
            city: profile.city || '',
            pincode: profile.pincode || '',
          });
        }

        // Fetch Progression live from Supabase
        const progRes = await getUserProgression(session.access_token);
        if (progRes.success && mounted) {
          setProgressionData({
            profile: progRes.profile,
            ledger: progRes.ledger,
          });
        }

        // Fetch Orders
        let orCondition = `user_id.eq.${session.user.id}`;
        if (session.user.email) orCondition += `,customer_email.eq.${session.user.email}`;

        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .or(orCondition)
          .order('created_at', { ascending: false });

        if (orderData && mounted) {
          setOrders(orderData);
        }

        // Check Admin Status
        const adminRes = await fetch('/api/admin/data?type=check', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.isAdmin && mounted) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSessionToken(session.access_token);
        fetchUserData(session);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          setSessionToken(null);
          router.push('/auth/unified');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Phone verification handlers
  const handleSendPhoneOtp = async () => {
    if (!phoneToVerify || phoneToVerify.trim().length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      return;
    }

    setPhoneVerifying(true);
    setPhoneError('');
    setPhoneMessage('');

    try {
      let formattedPhone = phoneToVerify.replace(/[\s()-]/g, '');
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (/^\d+$/.test(formattedPhone) && !formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      const { error } = await supabase.auth.updateUser({ phone: formattedPhone });
      if (error) throw error;
      setPhoneStep('otp');
      setPhoneMessage('OTP code sent successfully!');
      toast.success('Verification code dispatched!');
    } catch (err) {
      setPhoneError(err.message || 'Failed to send OTP code.');
      toast.error('Failed to send OTP.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setPhoneError('Please enter the verification code.');
      return;
    }

    setPhoneVerifying(true);
    setPhoneError('');
    setPhoneMessage('');

    try {
      let formattedPhone = phoneToVerify.replace(/[\s()-]/g, '');
      if (/^\d{10}$/.test(formattedPhone)) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (/^\d+$/.test(formattedPhone) && !formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: 'phone_change',
      });
      if (error) throw error;

      const {
        data: { user: updatedUser },
      } = await supabase.auth.getUser();
      setUser(updatedUser);
      setPhoneStep('input');
      setPhoneToVerify('');
      setOtpCode('');
      setPhoneMessage('Phone successfully verified!');
      toast.success('Phone verified! +100 Loyalty Points awarded.');

      if (sessionToken) {
        const res = await awardPoints(sessionToken, 100, 'Verify Phone');
        if (res.success) {
          const progRes = await getUserProgression(sessionToken);
          if (progRes.success) {
            setProgressionData({ profile: progRes.profile, ledger: progRes.ledger });
          }
        }
      }
    } catch (err) {
      setPhoneError(err.message || 'OTP verification failed.');
      toast.error('Invalid OTP code.');
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      const { error } = await supabase.auth.registerPasskey();
      if (error) throw error;
      toast.success('Passkey enrolled! +150 Loyalty Points awarded.');

      if (sessionToken) {
        const res = await awardPoints(sessionToken, 150, 'Register Passkey');
        if (res.success) {
          const progRes = await getUserProgression(sessionToken);
          if (progRes.success) {
            setProgressionData({ profile: progRes.profile, ledger: progRes.ledger });
          }
        }
      }
    } catch (err) {
      toast.error(err.message || 'Passkey enrollment canceled or unsupported.');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingAddress(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: addressForm.address,
          city: addressForm.city,
          pincode: addressForm.pincode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Saved address updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const toggleBusyDay = (day) => {
    setAgendaForm((prev) => {
      const current = prev.busyDays;
      if (current.includes(day)) {
        return { ...prev, busyDays: current.filter((d) => d !== day) };
      } else {
        return { ...prev, busyDays: [...current, day] };
      }
    });
  };

  const handleOptimizeSchedule = async (e) => {
    e.preventDefault();
    setOptimizing(true);
    try {
      const res = await optimizeDeliverySchedule({
        busyDays: agendaForm.busyDays,
        peakHours: agendaForm.peakHours,
        sleepHours: agendaForm.sleepHours,
      });
      if (res.success) {
        setOptimizationMatrix(res.data);
        toast.success('Schedule optimized!');
      } else {
        toast.error(res.error || 'Optimization failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setOptimizing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const tierInfo = getTierInfo(progressionData.profile?.total_points || 0);

  if (loading) {
    return (
      <div
        className="account-page"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--accent-gold)" />
          <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Loading VIP Account Hub...</p>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <main className="account-page">
      <div className="container">
        <div className="account-layout">
          
          {/* 1. SIDEBAR NAVIGATION */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'progression' ? 'active' : ''}`}
                onClick={() => setActiveTab('progression')}
              >
                <Award size={18} />
                <span>Lore & Progression</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'optimizer' ? 'active' : ''}`}
                onClick={() => setActiveTab('optimizer')}
              >
                <Compass size={18} />
                <span>Delivery Optimizer</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={18} />
                <span>Order History</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={18} />
                <span>Saved Addresses</span>
              </button>

              <Link
                href="/customer"
                className="nav-item"
                style={{ color: '#d4a359' }}
              >
                <Sparkles size={18} />
                <span>Event Passes & Hub</span>
              </Link>

              <button
                className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscriptions')}
              >
                <Coffee size={18} />
                <span>Subscriptions</span>
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="nav-item"
                  style={{ color: 'var(--accent-gold)', border: '1px dashed var(--accent-gold)' }}
                >
                  <Settings size={18} />
                  <span>Admin Command</span>
                </Link>
              )}

              <button className="nav-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* 2. MAIN CONTENT TABS */}
          <section className="main-content">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                <h2 className="tab-header">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Coffee Connoisseur'}!
                </h2>

                {/* Banner */}
                <div className="welcome-banner">
                  <div>
                    <h4>
                      <ShieldCheck size={18} /> Level Up Your Account Security & Get Free Points!
                    </h4>
                    <p>
                      Link multiple login methods below to secure your identity and earn up to{' '}
                      <strong style={{ color: 'var(--accent-gold)' }}>350 loyalty points</strong> + unlock biometric Passkeys!
                    </p>
                  </div>
                </div>

                {/* 3 KPI Cards */}
                <div className="overview-cards">
                  <div className="stat-card">
                    <h3>Total Orders</h3>
                    <div className="stat-value">{orders.length}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Lore Tier</h3>
                    <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: '6px' }}>
                      {tierInfo.currentTier.name}
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Janu Bhai Points</h3>
                    <div className="stat-value">{progressionData.profile?.total_points || 0}</div>
                  </div>
                </div>

                {/* Profile Details */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', margin: '0 0 12px' }}>
                    Account Details
                  </h3>
                  <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Name:</strong>{' '}
                    {user?.user_metadata?.full_name || 'Janu Bhai Member'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Email:</strong> {user?.email || 'N/A'}
                  </p>
                </div>

                {/* Security Milestones Panel */}
                <div className="security-milestone-panel">
                  <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={18} color="var(--accent-gold)" /> Security Milestones & Trust Score
                  </h3>

                  {/* Trust Score Progress */}
                  {(() => {
                    const hasPhone = !!user?.phone;
                    const hasGoogle = user?.identities?.some((id) => id.provider === 'google');
                    const hasFacebook = user?.identities?.some((id) => id.provider === 'facebook');
                    const hasPasskey = progressionData.ledger?.some((l) => l.action_type === 'Register Passkey');

                    let milestonesCount = 0;
                    if (hasPhone) milestonesCount++;
                    if (hasGoogle) milestonesCount++;
                    if (hasFacebook) milestonesCount++;
                    if (hasPasskey) milestonesCount++;

                    const ranks = [
                      'Coffee Seedling (Basic Trust)',
                      'Sprouting Espresso (Basic Trust)',
                      'Roasted Bean (Medium Trust)',
                      'Secure Barista (High Trust)',
                      'Coffee Cryptographer (Maximum Trust!)',
                    ];
                    const currentRank = ranks[milestonesCount];
                    const progressPercent = (milestonesCount / 4) * 100;

                    return (
                      <div className="security-meter-wrap">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Security Level:</span>
                          <strong style={{ color: 'var(--accent-gold)' }}>{currentRank}</strong>
                        </div>
                        <div className="security-meter-bar">
                          <div className="security-meter-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Completed {milestonesCount} of 4 security achievements
                        </span>
                      </div>
                    );
                  })()}

                  <div className="milestones-list">
                    {/* Phone Verification Item */}
                    {(() => {
                      const hasPhone = !!user?.phone;
                      return (
                        <div className="milestone-item">
                          <div style={{ flex: 1 }}>
                            <div className="milestone-title">
                              <Phone size={15} /> Phone Verification
                              <span className="milestone-points-badge">+100 Points</span>
                            </div>
                            <div className="milestone-desc">
                              {hasPhone ? `Verified: ${user.phone}` : 'Protect orders and enable SMS dispatch updates'}
                            </div>
                            {!hasPhone && (
                              <div style={{ marginTop: '10px' }}>
                                {phoneError && <p style={{ color: '#ff8a80', fontSize: '0.75rem', margin: '0 0 6px' }}>{phoneError}</p>}
                                {phoneMessage && <p style={{ color: '#69f0ae', fontSize: '0.75rem', margin: '0 0 6px' }}>{phoneMessage}</p>}
                                
                                {phoneStep === 'input' ? (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                      type="tel"
                                      placeholder="+91 98765 43210"
                                      value={phoneToVerify}
                                      onChange={(e) => setPhoneToVerify(e.target.value)}
                                      className="glass-input"
                                      style={{ maxWidth: '240px', padding: '8px 12px', fontSize: '0.85rem' }}
                                    />
                                    <button
                                      type="button"
                                      disabled={phoneVerifying}
                                      onClick={handleSendPhoneOtp}
                                      className="btn-gold-action"
                                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                                    >
                                      {phoneVerifying ? 'Sending...' : 'Send OTP'}
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                      type="text"
                                      placeholder="Enter OTP"
                                      value={otpCode}
                                      onChange={(e) => setOtpCode(e.target.value)}
                                      className="glass-input"
                                      style={{ maxWidth: '160px', padding: '8px 12px', fontSize: '0.85rem' }}
                                    />
                                    <button
                                      type="button"
                                      disabled={phoneVerifying}
                                      onClick={handleVerifyPhoneOtp}
                                      className="btn-gold-action"
                                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                                    >
                                      {phoneVerifying ? 'Verifying...' : 'Verify'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setPhoneStep('input'); setPhoneError(''); setPhoneMessage(''); }}
                                      className="btn-glass-secondary"
                                      style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                                    >
                                      Back
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {hasPhone && (
                            <span style={{ fontSize: '0.8rem', color: '#69f0ae', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Linked (+100 XP)
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Google Item */}
                    {(() => {
                      const hasGoogle = user?.identities?.some((id) => id.provider === 'google');
                      return (
                        <div className="milestone-item">
                          <div>
                            <div className="milestone-title">
                              Link Google Account
                              <span className="milestone-points-badge">+50 Points</span>
                            </div>
                            <div className="milestone-desc">Sign in faster with your Google identity</div>
                          </div>
                          {hasGoogle ? (
                            <span style={{ fontSize: '0.8rem', color: '#69f0ae', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Linked (+50 XP)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.href } })}
                              className="btn-glass-secondary"
                            >
                              Link Google
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Facebook Item */}
                    {(() => {
                      const hasFacebook = user?.identities?.some((id) => id.provider === 'facebook');
                      return (
                        <div className="milestone-item">
                          <div>
                            <div className="milestone-title">
                              Link Facebook Account
                              <span className="milestone-points-badge">+50 Points</span>
                            </div>
                            <div className="milestone-desc">Sign in faster with your Facebook identity</div>
                          </div>
                          {hasFacebook ? (
                            <span style={{ fontSize: '0.8rem', color: '#69f0ae', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Linked (+50 XP)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => supabase.auth.linkIdentity({ provider: 'facebook', options: { redirectTo: window.location.href } })}
                              className="btn-glass-secondary"
                            >
                              Link Facebook
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Passkey Item */}
                    {(() => {
                      const hasPhone = !!user?.phone;
                      const hasPasskey = progressionData.ledger?.some((l) => l.action_type === 'Register Passkey');
                      return (
                        <div className="milestone-item">
                          <div>
                            <div className="milestone-title">
                              Enable Passkey Login
                              <span className="milestone-points-badge">+150 Points</span>
                            </div>
                            <div className="milestone-desc">Use Touch ID / Face ID for passwordless logins</div>
                          </div>
                          {hasPasskey ? (
                            <span style={{ fontSize: '0.8rem', color: '#69f0ae', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Enrolled (+150 XP)
                            </span>
                          ) : !hasPhone ? (
                            <span style={{ fontSize: '0.78rem', color: '#ff8a80', fontWeight: 600 }}>
                              Verify Phone First
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleRegisterPasskey}
                              className="btn-gold-action"
                              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                            >
                              Enroll Passkey
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LORE & PROGRESSION */}
            {activeTab === 'progression' && (
              <div className="tab-content">
                <h2 className="tab-header">Coffee Lore & Progression</h2>

                <div className="lore-card">
                  <div className="tier-title-container">
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-playfair)' }}>
                      {tierInfo.currentTier.name}
                    </h3>
                    <span className="tier-badge">Rank Tier</span>
                  </div>

                  <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '4px 0 16px' }}>
                    &ldquo;{tierInfo.currentTier.description}&rdquo;
                  </p>

                  <div className="progress-bar-outer">
                    <motion.div
                      className="progress-bar-inner"
                      initial={{ width: '0%' }}
                      animate={{ width: `${tierInfo.progressPercent}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>

                  {/* Clean Formatted Points Summary without text concatenation bug */}
                  <div className="points-text-summary">
                    <span className="pts-accumulated">{tierInfo.totalPoints} Points Accumulated</span>
                    <span className="pts-separator">·</span>
                    {tierInfo.nextTier ? (
                      <span className="pts-next">
                        <strong>{tierInfo.pointsToNext} points</strong> needed to unlock{' '}
                        <strong>{tierInfo.nextTier.name}</strong>
                      </span>
                    ) : (
                      <span className="pts-next" style={{ color: 'var(--accent-gold)' }}>
                        ✨ Max Lore Level Achieved!
                      </span>
                    )}
                  </div>
                </div>

                {/* Points Ledger */}
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-playfair)', margin: '0 0 12px' }}>
                    Points Ledger
                  </h3>
                  {progressionData.ledger.length === 0 ? (
                    <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                      <Coffee size={32} color="var(--accent-gold)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ margin: 0 }}>No ledger history yet. Complete orders and verify security milestones to earn coffee points!</p>
                    </div>
                  ) : (
                    <div className="ledger-cards">
                      {progressionData.ledger.map((entry) => (
                        <div key={entry.id} className="ledger-card-item">
                          <div>
                            <span className="ledger-action-type">{entry.action_type}</span>
                            <span className="ledger-date">
                              {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <span className="ledger-points">+{entry.points_awarded} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SMART DELIVERY AGENDA OPTIMIZER */}
            {activeTab === 'optimizer' && (
              <div className="tab-content">
                <h2 className="tab-header">Smart Delivery Agenda Optimizer</h2>
                <p style={{ marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Select your active weekly busy days and daily workload schedule. Our edge algorithms will calculate optimal batch roast timing, express dispatch windows, and a personalized caffeine focus timeline.
                </p>

                <form onSubmit={handleOptimizeSchedule} style={{ maxWidth: '640px' }}>
                  <div className="form-group">
                    <label>Select Weekly Busy Days</label>
                    {/* Interactive Day Chips */}
                    <div className="day-chips-grid">
                      {daysOfWeek.map((day) => {
                        const isSelected = agendaForm.busyDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`day-chip-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleBusyDay(day)}
                          >
                            {isSelected ? '✓ ' : ''}{day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '16px' }}>
                    <div className="form-group">
                      <label>Peak Focus / Workload Hour</label>
                      <input
                        type="time"
                        required
                        value={agendaForm.peakHours}
                        onChange={(e) => setAgendaForm({ ...agendaForm, peakHours: e.target.value })}
                        className="glass-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Sleep Target (Hours)</label>
                      <input
                        type="number"
                        min="4"
                        max="12"
                        required
                        value={agendaForm.sleepHours}
                        onChange={(e) => setAgendaForm({ ...agendaForm, sleepHours: Number(e.target.value) })}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-gold-action" style={{ width: '100%', marginTop: '12px' }} disabled={optimizing}>
                    {optimizing ? 'Computing Schedule Matrix...' : 'Compute Scheduling Matrix'}
                  </button>
                </form>

                {optimizationMatrix && (
                  <div className="matrix-grid">
                    <div className="matrix-card">
                      <h3>Logistical Dispatch Matrix</h3>
                      <p style={{ margin: '0 0 6px', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Primary Dispatch Day:</strong>{' '}
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{optimizationMatrix.primaryDeliveryDay}</span>
                      </p>
                      <p style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Secondary Backup Day:</strong>{' '}
                        {optimizationMatrix.backupDeliveryDay}
                      </p>
                      {optimizationMatrix.logisticalAdjustments?.map((adj, i) => (
                        <div key={i} style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{adj.factor}</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{adj.adjustment}</span>
                        </div>
                      ))}
                    </div>

                    <div className="matrix-card">
                      <h3>Agenda Caffeine Timeline</h3>
                      {optimizationMatrix.brewTimeline?.map((item, i) => (
                        <div key={i} className="timeline-item-matrix">
                          <span style={{ fontWeight: 700, color: 'var(--accent-gold)', display: 'block', fontSize: '0.88rem' }}>
                            {item.time} — {item.action}
                          </span>
                          <p style={{ margin: '3px 0', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.recommendedBlend}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {item.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="tab-content">
                <h2 className="tab-header">Your Order History</h2>
                {orders.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                    <Package size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ margin: '0 0 16px' }}>You haven&apos;t placed any orders yet. Start your journey with Janu Bhai!</p>
                    <Link href="/product/instantcoffee" className="btn-gold-action">
                      Explore Coffee Blends <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.28)',
                          border: '1px solid rgba(245, 240, 234, 0.1)',
                          borderRadius: '18px',
                          padding: '22px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 900, color: 'var(--accent-gold)', fontSize: '1.2rem', fontFamily: 'var(--font-playfair)' }}>
                              ₹{order.total_amount}
                            </p>
                            <span
                              style={{
                                display: 'inline-block',
                                background: 'rgba(216, 154, 30, 0.15)',
                                color: 'var(--accent-gold)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                textTransform: 'capitalize',
                              }}
                            >
                              {order.status ? order.status.replace(/_/g, ' ') : 'Confirmed'}
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(245, 240, 234, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Items: {order.items?.length || 1} pack(s)
                          </span>
                          <Link
                            href={`/track?order=${encodeURIComponent(order.id)}`}
                            className="btn-glass-secondary"
                            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                          >
                            <Truck size={14} /> Track Delivery
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="tab-content">
                <h2 className="tab-header">Saved Addresses</h2>
                <form className="address-form" onSubmit={handleSaveAddress}>
                  <div className="form-group">
                    <label>Street Address</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="123 Coffee Bean Lane, Near Roastery..."
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="glass-textarea"
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        required
                        placeholder="Chikmagaluru"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="glass-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode / ZIP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="577101"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-gold-action" disabled={savingAddress} style={{ marginTop: '12px' }}>
                    {savingAddress ? 'Saving Address...' : 'Save Default Address'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 6: COFFEE SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
              <div className="tab-content">
                <h2 className="tab-header">Coffee on Autopilot</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  Never run out of freshly roasted single-origin coffee. Get your customized batch delivered automatically with exclusive VIP subscriber perks.
                </p>

                <div className="subscription-features-row">
                  <span className="feature-badge-gold">
                    <CheckCircle2 size={16} color="var(--accent-gold)" /> 15% Off Every Order
                  </span>
                  <span className="feature-badge-gold">
                    <Truck size={16} color="var(--accent-gold)" /> Free Express Pan-India Shipping
                  </span>
                  <span className="feature-badge-gold">
                    <Sparkles size={16} color="var(--accent-gold)" /> Pause or Cancel Anytime
                  </span>
                </div>

                {/* Subscription Frequency Cards */}
                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: 'var(--text-primary)' }}>Select Delivery Frequency:</h4>
                <div className="sub-plan-cards-grid">
                  <div
                    className={`sub-plan-card ${selectedSubFrequency === '2weeks' ? 'active' : ''}`}
                    onClick={() => setSelectedSubFrequency('2weeks')}
                  >
                    <div className="sub-plan-title">Every 2 Weeks</div>
                    <div className="sub-plan-discount">15% RECURRING SAVINGS</div>
                    <p className="sub-plan-desc">For active daily coffee connoisseurs and multiple cup households.</p>
                  </div>

                  <div
                    className={`sub-plan-card ${selectedSubFrequency === '4weeks' ? 'active' : ''}`}
                    onClick={() => setSelectedSubFrequency('4weeks')}
                  >
                    <div className="sub-popular-badge">Most Popular</div>
                    <div className="sub-plan-title">Every 4 Weeks</div>
                    <div className="sub-plan-discount">15% RECURRING SAVINGS</div>
                    <p className="sub-plan-desc">The standard monthly coffee ritual for single-cup daily brewers.</p>
                  </div>

                  <div
                    className={`sub-plan-card ${selectedSubFrequency === '8weeks' ? 'active' : ''}`}
                    onClick={() => setSelectedSubFrequency('8weeks')}
                  >
                    <div className="sub-plan-title">Every 8 Weeks</div>
                    <div className="sub-plan-discount">15% RECURRING SAVINGS</div>
                    <p className="sub-plan-desc">For casual sippers and iced coffee weekend enthusiasts.</p>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/checkout?mode=subscription&frequency=${selectedSubFrequency}`}
                  className="btn-gold-action"
                  style={{ display: 'inline-flex', padding: '14px 32px' }}
                >
                  <Coffee size={18} />
                  <span>Start Coffee Subscription (15% OFF)</span>
                </Link>
              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}
