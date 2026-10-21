import logo from '../assets/logo.png';

export default function Brand({ compact = false, light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-symbol" aria-hidden="true"><img src={logo} alt="" /></span>
      {!compact && <span className="brand-copy">
        <span className="brand-name">Easy Education</span>
        <span className="brand-tagline">INSTITUTION MANAGEMENT</span>
      </span>}
    </div>
  );
}
