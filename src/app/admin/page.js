```
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Women',
    price: '',
    description: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setProducts([...products, data.data]);
        setShowForm(false);
        setFormData({ name: '', category: 'Women', price: '', description: '', stock: '' });
      }
    } catch (error) {
      console.error('Failed to create product', error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-primary dark:text-cream">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-red-500 hover:text-red-600 text-sm font-semibold uppercase tracking-wide">
            Sign Out
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-2">Total Sales</h2>
          <p className="text-3xl text-secondary font-mono">$0</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-2">Total Products</h2>
          <p className="text-3xl text-primary font-mono">{products.length}</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold mb-2">Inventory Alert</h2>
          <p className="text-3xl text-red-500 font-mono">0 Items</p>
        </div>
      </div>
      
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold">Products Management</h2>
           <button 
             onClick={() => setShowForm(!showForm)}
             className="px-6 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-light transition-all shadow-md"
           >
             {showForm ? 'Cancel' : '+ Add Product'}
           </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="mb-10 p-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-fade-in">
             <h3 className="text-lg font-bold mb-4">Add New Product</h3>
             <form onSubmit={handleCreateProduct} className="grid md:grid-cols-2 gap-6">
                <input name="name" placeholder="Product Name" onChange={handleInputChange} className="p-3 rounded border dark:bg-zinc-900 dark:border-zinc-700" required />
                <select name="category" onChange={handleInputChange} className="p-3 rounded border dark:bg-zinc-900 dark:border-zinc-700" required>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Accessories">Accessories</option>
                </select>
                <input name="price" type="number" placeholder="Price" onChange={handleInputChange} className="p-3 rounded border dark:bg-zinc-900 dark:border-zinc-700" required />
                <input name="stock" type="number" placeholder="Stock Quantity" onChange={handleInputChange} className="p-3 rounded border dark:bg-zinc-900 dark:border-zinc-700" required />
                <textarea name="description" placeholder="Description" onChange={handleInputChange} className="md:col-span-2 p-3 rounded border dark:bg-zinc-900 dark:border-zinc-700" rows="3" required></textarea>
                <button type="submit" className="md:col-span-2 py-3 bg-secondary text-white font-bold rounded hover:bg-green-700 transition-colors">Save Product</button>
             </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          {loading ? (
             <div className="p-8 text-center opacity-50">Loading products...</div>
          ) : products.length === 0 ? (
             <div className="p-8 text-center opacity-50">No products found. Add your first product!</div>
          ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-sm uppercase">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 opacity-80">{product.category}</td>
                    <td className="p-4 font-mono">${product.price}</td>
                    <td className="p-4 font-mono">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
```
