import React from 'react';
import { Printer, X, ShieldCheck, MapPin, Calendar, FileText } from 'lucide-react';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
        {/* Actions header (Hidden on Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#1b4332" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>
              Mandi Trade Invoice & Gate Pass
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-sm btn-primary">
              <Printer size={16} /> Print Receipt / Gate Pass
            </button>
            <button onClick={onClose} style={{ padding: '0.35rem', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-invoice" style={{
          backgroundColor: '#ffffff',
          border: '2px solid #2d6a4f',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2d6a4f', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>🌾</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b4332' }}>
                  FarmLink <span style={{ color: '#d97706' }}>India</span>
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                All-India Agricultural Direct Marketplace • APMC Mandi Regulated Gate Pass
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-confirmed" style={{ fontSize: '0.85rem' }}>
                OFFICIAL ORDER RECEIPT
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginTop: '0.35rem' }}>
                #{order.order_number}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Date: {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Farmer & Buyer Information Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                🌾 Farmer (Seller) Details
              </span>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                {order.farmer_name}
              </div>
              <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Phone: {order.farmer_phone}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Mandi Yard: {order.farmer_location}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                🏢 Buyer (Procurement) Details
              </span>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginTop: '0.2rem' }}>
                {order.buyer_name}
              </div>
              <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Phone: {order.buyer_phone}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Destination: {order.buyer_location}
              </div>
            </div>
          </div>

          {/* Trade Details Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#1b4332', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.75rem' }}>Commodity / Crop</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Quantity</th>
                <th style={{ padding: '0.65rem 0.75rem' }}>Agreed Rate</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#1e293b' }}>
                  {order.crop_name}
                </td>
                <td style={{ padding: '0.85rem 0.75rem' }}>
                  {order.quantity} {order.unit}
                </td>
                <td style={{ padding: '0.85rem 0.75rem' }}>
                  ₹{order.agreed_price} / {order.unit}
                </td>
                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: '1.1rem' }}>
                  ₹{order.total_amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #2d6a4f' }}>
                <td colSpan={3} style={{ padding: '0.75rem', fontWeight: 800, textAlign: 'right', fontSize: '1rem' }}>
                  Total Settlement Amount:
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 800, color: '#15803d', fontSize: '1.25rem', textAlign: 'right' }}>
                  ₹{order.total_amount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Mandi Logistics & Gate Pass Stamp */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px dashed #16a34a',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.85rem',
            color: '#15803d',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong>Dispatch Authorization:</strong> Valid for Mandi Yard Pickup / Weighbridge Gate Clearance.
              <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                Logistics note: {order.delivery_pickup_info || 'Direct farmer mandi yard handover.'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.4rem 0.75rem', border: '1.5px solid #16a34a', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              GATE PASS VERIFIED
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '30px', marginBottom: '0.35rem' }} />
              <span>Farmer Confirmation</span>
            </div>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '30px', marginBottom: '0.35rem' }} />
              <span>Buyer Receiver Stamp</span>
            </div>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '30px', marginBottom: '0.35rem' }} />
              <span>FarmLink Platform Verification</span>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
