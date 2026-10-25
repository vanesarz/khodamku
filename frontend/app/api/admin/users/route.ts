import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api/v1';

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Mbah Darmo',
    email: 'admin@example.com',
    role: 'admin',
    profile: { no_hp: '08123456789', alamat: 'Kantor Pusat KhodamKu', weton: 'Wage', tanggal_lahir: '1945-01-01' },
  },
  {
    id: 2,
    name: 'Sekar Ayu Lestari',
    email: 'sekar@khodamku.test',
    role: 'pengamal',
    profile: { no_hp: '081234567801', alamat: 'Jl. Kenanga No. 12, Sleman', weton: 'Legi', tanggal_lahir: '1998-04-14' },
  },
  {
    id: 3,
    name: 'Bima Saputra',
    email: 'bima@khodamku.test',
    role: 'pengamal',
    profile: { no_hp: '081234567802', alamat: 'Jl. Pahlawan No. 45, Solo', weton: 'Wage', tanggal_lahir: '1995-08-20' },
  },
  {
    id: 4,
    name: 'Raka Pratama',
    email: 'raka@khodamku.test',
    role: 'pengamal',
    profile: { no_hp: '081234567803', alamat: 'Jl. Riau No. 88, Bandung', weton: 'Pon', tanggal_lahir: '1997-12-05' },
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const queryParams = new URLSearchParams();
    if (search) queryParams.set('search', search);
    if (role && role !== 'all') queryParams.set('role', role);

    if (token) {
      const res = await fetch(`${LARAVEL_API_URL}/admin/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        const items = json.data?.data || json.data || [];
        return NextResponse.json({
          success: true,
          data: items,
          pagination: {
            total: json.data?.total || items.length,
            current_page: json.data?.current_page || 1,
            last_page: json.data?.last_page || 1,
          },
        });
      }
    }

    let list = DEFAULT_USERS;
    if (role && role !== 'all') {
      list = list.filter((u) => u.role === role);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    return NextResponse.json({
      success: true,
      data: list,
      pagination: { total: list.length, current_page: 1, last_page: 1 },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Admin Users GET error:', error);
    return NextResponse.json({ success: true, data: DEFAULT_USERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();

    const payload = {
      name: body.name,
      email: body.email,
      password: body.password,
      password_confirmation: body.password_confirmation || body.password,
      role: body.role || 'pengamal',
    };

    const res = await fetch(`${LARAVEL_API_URL}/admin/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: json.message || 'Gagal menambahkan user', errors: json.errors },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: json.message || 'Akun pengguna berhasil didaftarkan',
      data: json.data,
    }, { status: 201 });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error('Admin Users POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat menambahkan user' }, { status: 500 });
  }
}
