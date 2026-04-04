import React from 'react';

export const metadata = {
  title: "Privacy Policy | Ali Mobile Repair",
  description: "Privacy policy for Ali Mobile Repair - how we handle your data and device information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-container" style={{ paddingTop: '160px' }}>
      <h1>Privacy Policy</h1>
      <p style={{ opacity: 0.7 }}>Last Updated: March 2026</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>1. Introduction</h2>
        <p>
          Ali Mobile Repair ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
          how we collect, use, and safeguard your personal information when you use our website and repair services 
          in Melbourne, Victoria.
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, phone number, and email address provided during booking.</li>
          <li><strong>Device Information:</strong> Model, IMEI, and specific repair issues for diagnostic purposes.</li>
          <li><strong>Booking Data:</strong> Appointment times and service history stored in our POS system.</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>3. How We Use Your Information</h2>
        <p>We use your data primarily to:</p>
        <ul>
          <li>Process and track your device repair.</li>
          <li>Send automated SMS notifications regarding repair status.</li>
          <li>Provide customer support and follow-up services.</li>
          <li>Comply with local Australian consumer laws and safety regulations.</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>4. Data Security</h2>
        <p>
          We use industry-standard security measures, including secure POS integration, to ensure that your 
          personal details are protected from unauthorized access. We do not sell or share your data with 
          third-party marketers.
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, correct, or request deletion of your personal information held in our records. 
          For any privacy-related inquiries, please visit us in-store at Ringwood Square Shopping Centre.
        </p>
      </section>

      <section style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--secondary)', borderRadius: '10px' }}>
        <h2>Contact Us</h2>
        <p>Ali Mobile Repair</p>
        <p>Kiosk C1, Ringwood Square Shopping Centre, Ringwood, VIC 3134</p>
        <p>Phone: 0481 058 514</p>
      </section>
    </div>
  );
}
