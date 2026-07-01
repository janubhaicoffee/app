import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }

  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return { error: 'Invalid token', status: 401 }
  }

  const { data: staff } = await supabaseAdmin
    .from('outlet_staff')
    .select('*, outlet:outlets(*)')
    .eq('user_id', user.id)
    .maybeSingle()

  return { user, staff }
}

export async function getUserRole(outletId) {
  const { data: staff } = await supabaseAdmin
    .from('outlet_staff')
    .select('role')
    .eq('outlet_id', outletId)
    .maybeSingle()

  return staff?.role || null
}

export async function requireRole(request, allowedRoles) {
  const auth = await verifyAuth(request)
  if (auth.error) return { error: auth.error, status: auth.status }

  if (!auth.staff || !allowedRoles.includes(auth.staff.role)) {
    return { error: 'Forbidden', status: 403 }
  }

  return auth
}

export function getOutletFromHost(request) {
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]
  const parts = host.split('.')

  if (parts.length >= 3) {
    const subdomain = parts[0]
    if (!['www', 'pos', 'outlet', 'admin'].includes(subdomain)) {
      return subdomain
    }
  }

  return null
}
