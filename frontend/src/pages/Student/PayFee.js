import React, { useState } from 'react';
import api from '../../api/api';

const PayFee = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Card');
  const [reference, setReference] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [semester, setSemester] = useState('Fall');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/student/pay-fee', {
        studentID: localStorage.getItem('referenceID'),
        amount: parseFloat(amount),
        method,
        reference,
        bankAccount,
        semester
      });
      setMessage({
        type: 'success',
        text: `Payment submitted successfully! Receipt: ${res.data.receipt}. Your payment status is now Pending Finance Manager verification.`
      });
      setAmount('');
      setReference('');
      setBankAccount('');
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Payment submission failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="mb-4 text-start">
        <h3 className="fw-bold text-white">Fee Settlement portal</h3>
        <p className="text-secondary">Submit transaction receipts or verify card details for semester tuition clearance.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-12">
          <div className="glass-card p-4 text-start">
            <h5 className="fw-semibold text-white mb-4">Submit Payment Voucher</h5>
            
            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4 py-2 small`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Semester</label>
                <select 
                  className="form-select form-glass-control" 
                  value={semester} 
                  onChange={e => setSemester(e.target.value)}
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Payment Amount (PKR)</label>
                <input 
                  type="number" 
                  className="form-control form-glass-control" 
                  required 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="e.g. 50000"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Payment Channel</label>
                <select 
                  className="form-select form-glass-control" 
                  value={method} 
                  onChange={e => setMethod(e.target.value)}
                >
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Deposit</option>
                  <option value="Mobile Wallet">Mobile Wallet (EasyPaisa/JazzCash)</option>
                  <option value="Cash">Cash Counter Voucher</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-medium">Reference / Receipt ID</label>
                <input 
                  className="form-control form-glass-control" 
                  value={reference} 
                  onChange={e => setReference(e.target.value)} 
                  placeholder="Enter Transaction Ref Number"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-medium">Sender Bank Account Number</label>
                <input 
                  className="form-control form-glass-control" 
                  value={bankAccount} 
                  onChange={e => setBankAccount(e.target.value)} 
                  placeholder="Enter Account ID used for payment (encrypted)"
                />
                <span className="text-secondary small d-block mt-1">This will be securely encrypted inside the database.</span>
              </div>

              <div className="text-end">
                <button 
                  type="submit" 
                  className="btn btn-glass px-4 py-2 fw-bold"
                  disabled={loading}
                >
                  {loading ? 'Submitting Receipt...' : 'Submit Receipt for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayFee;
