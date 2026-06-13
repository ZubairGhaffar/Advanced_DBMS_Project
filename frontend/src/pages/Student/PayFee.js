import React, { useState } from 'react';
import api from '../../api/api';

const PayFee = () => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Card');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/student/pay-fee', {
        studentID: localStorage.getItem('referenceID'),
        amount: parseFloat(amount),
        method,
        reference
      });
      setMessage(`Payment successful: ${res.data.receipt}`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Fee Payment</h3>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Amount</label>
          <input type="number" className="form-control" required value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select className="form-select" value={method} onChange={e => setMethod(e.target.value)}>
            <option>Card</option>
            <option>Bank</option>
            <option>Mobile Wallet</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Reference</label>
          <input className="form-control" value={reference} onChange={e => setReference(e.target.value)} />
        </div>
        <button className="btn btn-primary">Submit Payment</button>
      </form>
    </div>
  );
};

export default PayFee;
