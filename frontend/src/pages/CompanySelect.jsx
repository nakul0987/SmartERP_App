import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

export default function CompanySelect() {
  const [companies, setCompanies] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ companyName: '', address: '', gstNumber: '', financialYearStart: '' });
  const { token, setActiveCompany } = useContext(AppContext);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/companies`, config);
      setCompanies(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/companies`, form, config);
      setShowCreate(false);
      fetchCompanies();
    } catch (err) { alert(err.response?.data?.message || 'Error creating company'); }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Select Working Company / Enterprise</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {companies.map(c => (
          <div key={c._id} onClick={() => setActiveCompany(c)} style={{ border: '2px solid #24333c', padding: '20px', cursor: 'pointer', background: '#fff', width: '200px' }}>
            <h3>{c.companyName}</h3>
            <p>GST: {c.gstNumber}</p>
          </div>
        ))}
      </div>
      <button onClick={() => setShowCreate(!showCreate)} style={{ marginTop: '20px', padding: '10px', background: '#007acc', color: '#fff', border: 'none' }}>
        {showCreate ? 'Cancel' : '+ Create New Company (Max 5)'}
      </button>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ marginTop: '20px', maxWidth: '400px', background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
          <h3>New Company Fields</h3>
          <input placeholder="Company Name" onChange={e => setForm({...form, companyName: e.target.value})} required style={{width:'100%', marginBottom:'10px', padding:'5px'}} />
          <input placeholder="Address" onChange={e => setForm({...form, address: e.target.value})} required style={{width:'100%', marginBottom:'10px', padding:'5px'}} />
          <input placeholder="GST Number" onChange={e => setForm({...form, gstNumber: e.target.value})} required style={{width:'100%', marginBottom:'10px', padding:'5px'}} />
          <input type="date" placeholder="Financial Year Start" onChange={e => setForm({...form, financialYearStart: e.target.value})} required style={{width:'100%', marginBottom:'10px', padding:'5px'}} />
          <button type="submit" style={{background:'#24333c', color:'#fff', padding:'5px 10px'}}>Save Company</button>
        </form>
      )}
    </div>
  );
}