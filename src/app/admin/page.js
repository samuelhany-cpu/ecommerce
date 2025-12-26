"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');

  // Product Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Women',
    price: '',
    description: '',
    stock: '',
    imageUrl: '',
    sku: '',
    slug: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Security Check: Verify Admin Status
      const verifyRes = await fetch('/api/auth/verify');
      const verifyData = await verifyRes.json();

      if (!verifyData.authenticated || verifyData.user.role !== 'admin') {
        router.push('/');
        return;
      }

      const [prodRes, orderRes, userRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/admin/users')
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const userData = await userRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (orderData.success) setOrders(orderData.data || []);
      if (userData.success) setUsers(userData.data || []);

    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Women',
      price: '',
      description: '',
      stock: '',
      imageUrl: '',
      sku: '',
      slug: '',
      isActive: true
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
      imageUrl: product.images?.[0] || '',
      sku: product.sku || '',
      slug: product.slug || '',
      isActive: product.isActive !== false
    });
    setEditId(product._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if ((await res.json()).success) fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, images: formData.imageUrl ? [formData.imageUrl] : [] };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/products/${editId}` : '/api/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if ((await res.json()).success) {
      resetForm();
      fetchData();
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const result = await res.json();
    if (result.success) setFormData(prev => ({ ...prev, imageUrl: result.url }));
    setUploading(false);
  };

  // Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const lowStockItems = products.filter(p => p.stock < 5);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-zinc-50 min-h-screen pt-28 pb-12 px-6 text-primary">
      <div className="container mx-auto">
        <header className="flex justify-between items-end mb-16 px-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Operational Hub</span>
            <h1 className="text-5xl font-serif font-bold text-primary mt-2">Executive Overview</h1>
          </div>
          <button onClick={handleLogout} className="px-6 py-2 bg-white border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest text-primary hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
            Terminate Session
          </button>
        </header>

        {/* Analytics Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Revenue", val: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-secondary" },
            { label: "Total Orders", val: orders.length, color: "text-primary" },
            { label: "Inventory Health", val: `${products.length} Designs`, color: "text-primary" },
            { label: "Stock Alerts", val: `${lowStockItems.length} Critical`, color: lowStockItems.length > 0 ? "text-red-500" : "text-green-600" }
          ].map(stat => (
            <div key={stat.label} className="bg-white p-10 rounded-[2rem] shadow-sm border border-primary/10 min-h-[160px] flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">{stat.label}</p>
              <p className={`text-4xl font-mono font-black ${stat.color} truncate`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 bg-zinc-200 p-1.5 rounded-2xl w-fit">
          {['inventory', 'orders', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-zinc-300'}`}
            >
              {tab === 'inventory' ? 'Inventory' : tab === 'orders' ? 'Orders' : 'Personnel'}
            </button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-primary">Master Collection</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl hover:bg-primary-light transition-all flex items-center gap-2"
              >
                {showForm ? 'Close Workspace' : '+ Enlist New Design'}
              </button>
            </div>

            {showForm && (
              <div className="mb-12 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-primary/10 animate-slide-in-top">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Artifacts</label>
                    <input name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none focus:ring-2 ring-primary/20 text-primary border border-primary/10 font-bold" placeholder="Design Title" required />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary opacity-50">SKU Code</label>
                        <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-zinc-50 py-3 px-6 rounded-xl outline-none text-primary border border-primary/10 font-mono text-xs" placeholder="Auto-gen" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary opacity-50">URL Slug</label>
                        <input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full bg-zinc-50 py-3 px-6 rounded-xl outline-none text-primary border border-primary/10 font-mono text-xs" placeholder="Auto-gen" />
                      </div>
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Collection Tier</label>
                    <select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none appearance-none text-primary border border-primary/10 font-bold">
                      <option>Women</option>
                      <option>Men</option>
                      <option>Accessories</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary">Valuation ($)</label>
                        <input type="number" name="price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none text-primary border border-primary/10 font-bold" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary">Reserves</label>
                        <input type="number" name="stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-zinc-50 py-4 px-6 rounded-2xl outline-none text-primary border border-primary/10 font-bold" required />
                      </div>
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Imagery</label>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="bg-zinc-50 border-2 border-dashed border-primary/20 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors relative overflow-hidden"
                    >
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-[10px] uppercase font-black text-primary">Upload Artifact</span>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                      {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center">⌛</div>}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-primary/5">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-secondary"
                      />
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Deployment</label>
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Artifact Narrative</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="flex-grow bg-zinc-50 py-4 px-6 rounded-2xl outline-none resize-none text-primary border border-primary/10 font-bold" placeholder="The story behind the piece..." />
                    <div className="flex gap-4">
                      <button type="button" onClick={resetForm} className="flex-grow py-4 bg-zinc-100 text-primary font-bold rounded-2xl hover:bg-zinc-200 transition-all uppercase text-[10px] tracking-widest">Abort</button>
                      <button className="flex-[2] py-4 bg-secondary text-white font-bold rounded-2xl shadow-lg hover:bg-secondary/90 transition-all uppercase text-[10px] tracking-widest">
                        {isEditing ? 'Commit Changes' : 'Launch Design'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b border-primary/10">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-primary">
                    <th className="p-8">Artifact</th>
                    <th className="p-8">SKU Identifier</th>
                    <th className="p-8">Tier</th>
                    <th className="p-8 text-center">Status</th>
                    <th className="p-8">Valuation</th>
                    <th className="p-8">Reserves</th>
                    <th className="p-8 text-right">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <img src={p.images?.[0]} className="w-12 h-12 object-cover rounded-xl shadow-sm border border-zinc-200" alt="" />
                          <span className="font-serif font-bold text-primary">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-8 font-mono text-[10px] font-black tracking-widest text-primary/60">{p.sku || 'N/A'}</td>
                      <td className="p-8 text-sm font-bold text-primary">{p.category}</td>
                      <td className="p-8 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border-2 ${p.isActive !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {p.isActive !== false ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="p-8 font-mono text-secondary font-black text-lg">${p.price}</td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`} />
                          <span className={`font-mono font-bold text-md ${p.stock < 5 ? 'text-red-600' : 'text-primary'}`}>{p.stock}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right space-x-4">
                        <button onClick={() => handleEdit(p)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">Modify</button>
                        <button onClick={() => handleDelete(p._id)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">Expunge</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-primary">Manifest List</h2>
              <p className="text-sm text-primary italic mt-1 font-medium">Tracking the journey of every LuxeLeather piece.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b border-primary/10">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-primary font-bold">
                    <th className="p-8">Manifest ID</th>
                    <th className="p-8 text-left">Customer/Date</th>
                    <th className="p-8 text-left">Shipping</th>
                    <th className="p-8 text-left">Status</th>
                    <th className="p-8 text-left">Remittance</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {orders.length > 0 ? orders.map(o => {
                    const keyId = o.id ?? o._id;
                    const idStr = String(keyId);
                    return (
                    <tr key={idStr} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-8 font-mono text-sm font-bold text-primary">LL-{idStr.slice(-6)}</td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">{o.userId?.email || o.User?.email || 'N/A'}</span>
                          <span className="text-[10px] text-primary/60 uppercase tracking-wider">{new Date(o.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        {o.shippingAddress ? (
                          <div className="text-[10px] leading-relaxed text-primary/70">
                            <p className="font-bold">{o.shippingAddress.fullName}</p>
                            <p>{o.shippingAddress.street}, {o.shippingAddress.city}</p>
                          </div>
                        ) : <span className="text-[10px] text-primary/40 uppercase">No Address</span>}
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${o.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                            o.status === 'delivering' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              o.status === 'approved' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                            {o.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-8 font-mono font-black text-secondary text-lg">${o.totalAmount}</td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end">
                          <select
                            value={o.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              const res = await fetch('/api/orders', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: o.id, status: newStatus })
                              });
                              if ((await res.json()).success) {
                                // Silent refresh after update
                                fetchData(false);
                              }
                            }}
                            className="bg-primary text-white text-[10px] font-black uppercase tracking-widest p-2 px-4 rounded-lg cursor-pointer hover:bg-primary-light transition-colors border-none"
                          >
                            <option value="" disabled>Change Status</option>
                            <option value="pending" className="bg-white text-primary">Pending</option>
                            <option value="approved" className="bg-white text-primary">Approve</option>
                            <option value="delivering" className="bg-white text-primary">Ship</option>
                            <option value="delivered" className="bg-white text-primary">Complete</option>
                            <option value="cancelled" className="bg-white text-primary">Cancel</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                  }) : (
                    <tr>
                      <td colSpan="5" className="p-24 text-center text-primary italic font-bold">No orders found in the registry.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="animate-fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-primary">Personnel Registry</h2>
              <p className="text-sm text-primary italic mt-1 font-medium">Manage user identities and administrative privileges.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-primary/5 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 border-b border-primary/10">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-primary">
                    <th className="p-8">Identity</th>
                    <th className="p-8">Privileges</th>
                    <th className="p-8">Status</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-8">
                        <p className="font-bold text-primary text-md">{user.email}</p>
                        <p className="text-[10px] text-primary uppercase tracking-widest font-black">Signed up {new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-8">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${user.isVerified ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                          <div className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-amber-600 animate-pulse'}`} />
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button
                          onClick={async () => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            if (!confirm(`Promote/Demote ${user.email} to ${newRole}?`)) return;
                            const res = await fetch('/api/admin/users', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user.id, role: newRole })
                            });
                            if ((await res.json()).success) fetchData();
                          }}
                          className="bg-primary text-white text-[10px] font-black uppercase tracking-widest p-2 px-4 rounded-lg hover:bg-primary-light transition-colors"
                        >
                          Modify Privileges
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
