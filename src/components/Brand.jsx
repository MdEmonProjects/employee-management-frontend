import logo from '../assets/logo.png';

export default function Brand({ compact = false, className = '' }) {
  if (compact) {
    return (
      <span className={`overflow-hidden ${className}`}>
        <img src={logo} alt="Esy EduSoft" className="h-full w-auto max-w-none" />
      </span>
    );
  }

  return <img src={logo} alt="Esy EduSoft" className={`block h-auto w-full object-contain object-left ${className}`} />;
}
