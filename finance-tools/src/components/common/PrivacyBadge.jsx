export default function PrivacyBadge() {
    return (
        <div className="privacy-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>Your data stays on your device. We do not store personal financial information.</span>
        </div>
    );
}
