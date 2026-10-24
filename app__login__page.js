'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
export default function Login() {
  const [m, setM] = useState('login');
  const [f, setF] = useState({ login: '', username: '', email: '', password: '', otp: '' });
  const [on, setOn] = useState(false), [show, setShow] = useState(false), [e, setE] = useState(''), [info, setI] = useState(''), [busy, setB] = useState(false), [sk, setSk] = useState(0);
  useEffect(() => { fetch('/api/auth').then((r) => r.json()).then((d) => setOn(!!d.otp)).catch(() => {}); }, []);
  const set = (k) => (x) => setF({ ...f, [k]: x.target.value });
  const call = (mode) => fetch('/api/auth', { method: 'POST', body: JSON.stringify({ ...f, mode }) })
    .then(async (r) => { let j = {}; try { j = await r.json(); } catch {} return { ...j, ok: r.ok, error: j.error || (r.ok ? '' : 'Server error ' + r.status) }; })
    .catch(() => ({ ok: false, error: 'Koneksi gagal, coba lagi' }));
  const fail = (msg) => { setE(msg); setSk((n) => n + 1); };
  const go = (to) => { setM(to); setE(''); setI(''); };
  async function kirim() {
    setE(''); setI('');
    const d = await call(m === 'forgot' ? 'forgot_send' : 'send');
    d.ok ? setI('Jika akun terdaftar, kode dikirim ke Gmail (cek juga folder Spam).') : fail(d.error);
  }
  async function sub(ev) {
    ev.preventDefault(); setE(''); setI(''); setB(true);
    const d = await call(m === 'forgot' ? 'forgot_reset' : m);
    setB(false);
    if (!d.ok) return fail(d.error);
    if (m === 'forgot') { setF({ ...f, password: '', otp: '' }); setM('login'); setI('Password berhasil diganti. Silakan masuk.'); return; }
    location.href = d.admin ? '/admin' : '/';
  }
  const pwField = (label) => (
    <>
      <label className="l">{label}</label>
      <div className="pw">
        <input type={show ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={f.password} onChange={set('password')} required />
        <button type="button" onClick={() => setShow(!show)}>{show ? 'Sembunyi' : 'Lihat'}</button>
      </div>
    </>
  );
  return (
    <motion.form className="box" onSubmit={sub} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="brand"><span className="mark">R</span>Toko Akun Rehan</div>
      <div className="tabs">
        <button type="button" className={m === 'login' ? 'on' : ''} onClick={() => go('login')}>Masuk</button>
        <button type="button" className={m === 'register' ? 'on' : ''} onClick={() => go('register')}>Daftar</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={m} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
          {m === 'login' && (
            <>
              <label className="l">Username atau Gmail</label>
              <input placeholder="username atau nama@gmail.com" value={f.login} onChange={set('login')} autoCapitalize="none" required />
              {pwField('Password')}
              <p className="mut" style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => go('forgot')}>Lupa password?</p>
            </>
          )}
          {m === 'register' && (
            <>
              <label className="l">Username</label>
              <input placeholder="contoh: rehan_01" value={f.username} onChange={set('username')} autoCapitalize="none" required />
              <label className="l">Gmail</label>
              <input type="email" placeholder="nama@gmail.com" value={f.email} onChange={set('email')} required />
              {on && (
                <>
                  <button type="button" className="btn o sm" style={{ marginBottom: 12 }} onClick={kirim}>Kirim Kode Verifikasi</button>
                  <input inputMode="numeric" placeholder="Kode 6 digit dari Gmail" value={f.otp} onChange={set('otp')} required />
                </>
              )}
              {pwField('Password')}
            </>
          )}
          {m === 'forgot' && (
            <>
              <h3 style={{ margin: '4px 0 6px' }}>Lupa password</h3>
              {on ? (
                <>
                  <label className="l">Username atau Gmail</label>
                  <input placeholder="username atau nama@gmail.com" value={f.login} onChange={set('login')} autoCapitalize="none" required />
                  <button type="button" className="btn o sm" style={{ marginBottom: 12 }} onClick={kirim}>Kirim Kode ke Gmail</button>
                  <input inputMode="numeric" placeholder="Kode 6 digit dari Gmail" value={f.otp} onChange={set('otp')} required />
                  {pwField('Password baru')}
                </>
              ) : (
                <p className="mut" style={{ margin: '8px 0 14px' }}>Reset lewat email belum aktif. Silakan hubungi admin lewat tombol Chat Admin.</p>
              )}
              <p className="mut" style={{ cursor: 'pointer', fontSize: 14, marginTop: 8 }} onClick={() => go('login')}>Kembali ke halaman masuk</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      <p className="gold">{info}</p>
      <p key={sk} className={'err' + (e ? ' shake' : '')}>{e}</p>
      {!(m === 'forgot' && !on) && (
        <button className="btn" style={{ width: '100%', marginTop: 8 }} disabled={busy}>
          {busy ? 'Memproses…' : m === 'login' ? 'Masuk' : m === 'register' ? 'Daftar Sekarang' : 'Atur Ulang Password'}
        </button>
      )}
    </motion.form>
  );
}
