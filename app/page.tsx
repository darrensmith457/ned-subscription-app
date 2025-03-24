'use client';
import { useState } from 'react';

export default function Page() {
  const [eligible, setEligible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({ q1: false, q2: false, q3: false });
  const [form, setForm] = useState({
    tier: 'B1',
    prepay: 5,
    name: '',
    email: '',
    company: '',
    country: '',
  });

  const tierValues = { B0: 50000, B1: 100000, B2: 200000, B3: 500000 };
  const baseFees = {
    B0: { 0: 2.4, 5: 3.4, 10: 4.4, 15: 5.4 },
    B1: { 0: 2.4, 5: 3.4, 10: 4.4, 15: 5.4 },
    B2: { 0: 1.9, 5: 2.9, 10: 3.9, 15: 4.4 },
    B3: { 0: 1.4, 5: 2.4, 10: 3.4, 15: 3.9 },
  };

  const handleEligibility = (q) => {
    const updated = { ...answers, [q]: !answers[q] };
    setAnswers(updated);
    setEligible(updated.q1 && updated.q2 && updated.q3);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'prepay' ? parseInt(value) : value }));
  };

  const subAmt = tierValues[form.tier];
  const feeRate = baseFees[form.tier][form.prepay];
  const fee = (subAmt * feeRate) / 100;
  const prepayAmt = (subAmt * form.prepay) / 100;
  const bShares = subAmt - fee - prepayAmt;
  const corpTax = bShares * 0.10;
  const postTax = bShares - corpTax;
  const dividend = postTax * 0.95;
  const totalReturn = form.prepay === 0 ? dividend : dividend + prepayAmt;

  const handleSubmit = async () => {
    const endpoint = "https://hooks.zapier.com/hooks/catch/22015757/2e8310f/";
    const payload = {
      ...form,
      eligible: true,
      prepayAmount: prepayAmt,
      estimatedDividend: dividend,
      totalReturn,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSubmitted(true);
        console.log("Submission successful");
      } else {
        console.error("Submission failed with status:", response.status);
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: 'auto', padding: 20 }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>NED Subscription Interest</h1>

      {!eligible && !submitted && (
        <>
          <h2>Eligibility</h2>
          <div>
            <label><input type="checkbox" checked={answers.q1} onChange={() => handleEligibility('q1')} /> I am an Andorran Tax Resident</label><br />
            <label><input type="checkbox" checked={answers.q2} onChange={() => handleEligibility('q2')} /> I am a Director of an International Business</label><br />
            <label><input type="checkbox" checked={answers.q3} onChange={() => handleEligibility('q3')} /> I want consulting and a Non-Executive Director position in PeakColab</label><br />
          </div>
        </>
      )}

      {eligible && !submitted && (
        <>
          <h2 style={{ marginTop: 30 }}>Subscription Details</h2>
          <label>Choose Tier: </label>
          <select name="tier" value={form.tier} onChange={handleChange}>
            <option value="B0">B0 (£50K)</option>
            <option value="B1">B1 (£100K)</option>
            <option value="B2">B2 (£200K)</option>
            <option value="B3">B3 (£500K)</option>
          </select>

          <div style={{ marginTop: 10 }}>
            <label>
              Prepay Percentage: {form.prepay}% — £{prepayAmt.toLocaleString()}
            </label><br />
            <input type="range" name="prepay" min={0} max={15} step={5} value={form.prepay} onChange={handleChange} />
          </div>

          <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <p><strong>Subscription Amount:</strong> £{subAmt.toLocaleString()}</p>
            <p><strong>Management Fee:</strong> £{fee.toLocaleString()}</p>
            {form.prepay > 0 && <p><strong>Prepay Card Amount:</strong> £{prepayAmt.toLocaleString()}</p>}
            <p><strong>B Shares Issued:</strong> £{bShares.toLocaleString()}</p>
            <p><strong>Estimated Dividend:</strong> £{dividend.toLocaleString()}</p>
            <p><strong>Total Return:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>£{totalReturn.toLocaleString()}</span></p>
          </div>

          <h2 style={{ marginTop: 30 }}>Your Details</h2>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />
          <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />
          <input name="company" placeholder="Company Name" value={form.company} onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />
          <input name="country" placeholder="Country of Tax Residency" value={form.country} onChange={handleChange} style={{ width: '100%', marginBottom: 10 }} />

          <button onClick={handleSubmit} style={{ marginTop: 20 }}>Submit</button>
        </>
      )}

      {submitted && (
        <div>
          <h2>Thank you!</h2>
          <p>Your submission has been received.</p>
        </div>
      )}
    </div>
  );
}
