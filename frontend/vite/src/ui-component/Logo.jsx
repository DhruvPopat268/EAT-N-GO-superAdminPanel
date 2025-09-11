import logo from 'assets/images/logo.png';

export default function Logo() {
  return (
    <img
      src={logo}
      alt="Logo"
      width="80"
      height="50"
      style={{ cursor: 'pointer' }}
    />
  );
}
