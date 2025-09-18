import logo from 'assets/images/logo.png'; 

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', outline: 'none', boxShadow: 'none' }}>
      <img
        src={logo}
        alt="Logo"
        width="50"
        height="50"
        style={{ border: 'none', borderRadius: '0', background: 'transparent' }}
      />
      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', textDecoration: 'none', border: 'none', borderBottom: 'none', outline: 'none', boxShadow: 'none' }}>EAT-N-GO</span>
    </div>
  );
}