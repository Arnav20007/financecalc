/**
 * AdSlot — Reusable ad placement component
 * Ready for Google AdSense integration
 * 
 * Usage:
 * <AdSlot type="header" />
 * <AdSlot type="mid-content" />
 * <AdSlot type="bottom" />
 * <AdSlot type="sidebar" />
 * <AdSlot type="multiplex" />
 * 
 * To integrate AdSense:
 * 1. Replace the placeholder content with your AdSense ad unit code
 * 2. Add your data-ad-client and data-ad-slot attributes
 */

export default function AdSlot({ type = 'mid-content', className = '' }) {
    const slotId = `ad-slot-${type}-${Math.random().toString(36).substr(2, 5)}`;

    return (
        <div
            id={slotId}
            className={`ad-slot ad-slot--${type} ${className}`}
            role="complementary"
            aria-label="Advertisement"
            data-ad-type={type}
        >
            {/* 
        Replace this placeholder with your AdSense code:
        
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        
        Then call: (window.adsbygoogle = window.adsbygoogle || []).push({});
      */}
            <span>Ad Space — {type}</span>
        </div>
    );
}
