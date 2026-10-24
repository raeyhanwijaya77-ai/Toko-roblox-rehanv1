'use client';
import { useEffect, useState, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
const WA = process.env.NEXT_PUBLIC_WA_ADMIN || '6282319319768';
const SEC = 20;
export default function Order({ params }) {
  const { id } = use(params);
  const [o, setO] = useState(null);
  const [left, setLeft] = useState(SEC);
  const [auto, setAuto] = useState(true);
  const [cp, setCp] = useState('');
  useEffect(() => {
    let t;
    const load = async () => {
      try {
        const r = await fetch('/api/order/' + id);
        if (r.status === 401) return (location.href = '/login');
        const d = await r.json();
        setO(d);
        if (d.status !== 'paid') t = setTimeout(load, 4000);
      } catch { t = setTimeout(load, 6000); }
    };
    load();
    return () => clearTimeout(t);
  }, [id]);
  const paid = o?.status === 'paid' && !!o?.acc;
  const link = paid ? `https://wa.me/${WA}?text=${encodeURIComponent(`Halo admin, saya sudah bayar order ${o.id} (${o.acc.title}). Mohon bantu amankan akun saya.`)}` : '';
  useEffect(() => {
    if (!paid || !auto) return;
    if (left <= 0) { window.location.href = link; return; }
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [paid, auto, left, link]);
  async function copy(text, k) {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCp(k); setTimeout(() => setCp(''), 1500);
  }
  if (!o) return <p className="w mut">Memuat…</p>;
  if (paid) {
    return (
      <div className="box">
        <div className="check" />
        <h2 className="gold" style={{ textAlign: 'center' }}>Pembayaran Berhasil</h2>
        <p className="mut" style={{ textAlign: 'center' }}>{o.acc.title}</p>
        <div className="cred">
          <div className="cr"><span>Username</span><b>{o.acc.username}</b><button type="button" className="btn o sm" onClick={() => copy(o.acc.username, 'u')}>{cp === 'u' ? 'Tersalin' : 'Salin'}</button></div>
          <div className="cr"><span>Password</span><b>{o.acc.password}</b><button type="button" className="btn o sm" onClick={() => copy(o.acc.password, 'p')}>{cp === 'p' ? 'Tersalin' : 'Salin'}</button></div>
        </div>
        <div className="next">
          <b>Langkah terakhir: amankan akun</b>
          <p className="mut">Salin dulu username dan password di atas, lalu chat admin agar akun segera diamankan.{auto ? ` WhatsApp admin otomatis terbuka dalam ${left} detik.` : ''}</p>
          {auto && <div className="cdbar"><i style={{ width: ((SEC - left) / SEC) * 100 + '%' }} /></div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <a className="btn" href={link} target="_blank">Chat Admin Sekarang</a>
            {auto && <button type="button" className="btn o sm" onClick={() => setAuto(false)}>Batalkan pengalihan</button>}
          </div>
        </div>
        <p className="mut" style={{ marginTop: 12, fontSize: 13 }}>Data akun tetap tersimpan di menu Pesanan.</p>
      </div>
    );
  }
  return (
    <div className="box" style={{ textAlign: 'center' }}>
      <h2>Scan QRIS</h2>
      <p className="price" style={{ margin: '8px 0 16px' }}>Rp {o.amount.toLocaleString('id-ID')}</p>
      <div className="qrw" style={{ background: '#fff', padding: 14, borderRadius: 14, display: 'inline-block' }}><QRCodeSVG value={o.qr} size={230} /></div>
      <p className="mut" style={{ marginTop: 14 }}>Menunggu pembayaran… halaman ini otomatis diperbarui.<br />Order: {o.id}</p>
    </div>
  );
}
