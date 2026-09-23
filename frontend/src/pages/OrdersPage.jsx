import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AudioSpeaker from '../components/AudioSpeaker';
import InvoiceModal from '../components/InvoiceModal';

export default function OrdersPage() {
  const { user, isFarmer, isBuyer } = useAuth();
  const { lang, t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/orders');
      setOrders(res.orders || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      setUpdatingId(orderId);
      await api.patch(`/orders/${orderId}`, { status: nextStatus });
      await loadOrders();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const stages = ['CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED/PICKUP', 'DELIVERED'];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Package size={24} color="#1b4332" />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1b4332' }}>
                Order Fulfillment & Tracking
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Monitor agricultural order progress from farm harvest to mandi yard delivery
            </p>
          </div>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#dc2626', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📦</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '0.5rem' }}>
              No Confirmed Orders Yet
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              When a reserved offer is confirmed by buyer and farmer, an official order is automatically issued.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const currentStageIdx = stages.indexOf(order.status);

              return (
                <div key={order.id} className="card" style={{ padding: '1.75rem' }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.4rem' }}>🌾</span>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>
                          Order #{order.order_number}
                        </h3>
                        <span className="badge badge-confirmed">
                          {order.status}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Placed on: {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d' }}>
                        ₹{order.total_amount.toLocaleString()}
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {order.quantity} {order.unit} of {order.crop_name} @ ₹{order.agreed_price}/{order.unit}
                      </span>
                    </div>
                  </div>

                  {/* Stage Progress Stepper */}
                  <div style={{
                    margin: '1.25rem 0',
                    padding: '1.25rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      {stages.map((stage, idx) => {
                        const isCompleted = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center', position: 'relative' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isCompleted ? '#16a34a' : '#e2e8f0',
                              color: isCompleted ? '#ffffff' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              zIndex: 2,
                              border: isCurrent ? '3px solid #bbf7d0' : 'none'
                            }}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: isCurrent ? 800 : 600,
                              color: isCurrent ? '#16a34a' : isCompleted ? '#1e293b' : '#94a3b8',
                              marginTop: '0.4rem'
                            }}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Locations & Delivery Notes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
                    <div>
                      <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.2rem' }}>
                        🌾 Farmer Details:
                      </strong>
                      <div>{order.farmer_name} (Ph: {order.farmer_phone})</div>
                      <div style={{ color: '#64748b' }}>Pickup: {order.farmer_location}</div>
                    </div>

                    <div>
                      <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.2rem' }}>
                        🏢 Buyer Destination:
                      </strong>
                      <div>{order.buyer_name} (Ph: {order.buyer_phone})</div>
                      <div style={{ color: '#64748b' }}>Delivery: {order.buyer_location}</div>
                    </div>

                    <div>
                      <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.2rem' }}>
                        🚚 Logistics Information:
                      </strong>
                      <div style={{ fontStyle: 'italic', color: '#64748b' }}>
                        {order.delivery_pickup_info || 'Standard mandi yard pickup scheduled.'}
                      </div>
                    </div>
                  </div>

                  {/* Action & Progression Bar */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <AudioSpeaker
                      text={`Order ${order.order_number}. ${order.quantity} ${order.unit} of ${order.crop_name} between farmer ${order.farmer_name} and buyer ${order.buyer_name}. Total amount is ${order.total_amount} rupees. Current status is ${order.status}.`}
                      lang={lang}
                      label="Listen"
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="btn btn-sm btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={15} color="#2d6a4f" />
                        Gate Pass / Invoice
                      </button>

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          disabled={updatingId === order.id}
                          className="btn btn-sm btn-primary"
                        >
                          Mark as Processing / Packing
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'READY')}
                          disabled={updatingId === order.id}
                          className="btn btn-sm btn-accent"
                        >
                          Mark Ready for Mandi Yard Pickup
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'SHIPPED/PICKUP')}
                          disabled={updatingId === order.id}
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: '#2563eb' }}
                        >
                          <Truck size={15} />
                          Confirm In-Transit / Loaded
                        </button>
                      )}

                      {order.status === 'SHIPPED/PICKUP' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          disabled={updatingId === order.id}
                          className="btn btn-sm btn-success"
                        >
                          <CheckCircle size={15} />
                          Confirm Delivered & Received
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Printable Mandi Trade Invoice / Gate Pass Modal */}
        {selectedInvoiceOrder && (
          <InvoiceModal
            order={selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
          />
        )}
      </div>
    </div>
  );
}
