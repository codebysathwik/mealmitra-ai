import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isPast } from 'date-fns';
import { useApp } from '../context/AppContext';
import { Button, Input, Textarea, Select, PageHeader } from '../components/ui';
import { AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ALLERGEN_OPTIONS = ['gluten', 'dairy', 'nuts', 'peanuts', 'eggs', 'soy', 'seafood', 'sesame', 'sugar'];
const UNIT_OPTIONS = [
  { value: 'servings', label: 'Servings' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'packs', label: 'Packs' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'litres', label: 'Litres' },
  { value: 'plates', label: 'Plates' },
  { value: 'pieces', label: 'Pieces' },
];
const CATEGORY_OPTIONS = [
  { value: 'veg', label: '🌿 Vegetarian' },
  { value: 'non-veg', label: '🍗 Non-Vegetarian' },
];

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Food name is required.';
  if (!form.description.trim()) errors.description = 'Description is required.';
  if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
    errors.quantity = 'Enter a positive quantity.';
  if (!form.location.trim()) errors.location = 'Location is required.';
  if (!form.pickupDeadline) errors.pickupDeadline = 'Pickup deadline is required.';
  else if (isPast(new Date(form.pickupDeadline)))
    errors.pickupDeadline = 'Pickup deadline cannot be in the past.';
  if (!form.storageConditions.trim()) errors.storageConditions = 'Storage conditions are required.';
  return errors;
}

export default function AddEditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, addListing, updateListing, currentUser } = useApp();

  const existing = id ? listings.find(l => l.id === id) : null;

  // Only donor who owns it can edit
  if (existing && existing.donorId !== currentUser.id) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <AlertTriangle size={40} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Not Authorized</h2>
        <p className="text-gray-500 mb-4">You can only edit your own listings.</p>
        <Button onClick={() => navigate('/donor')}>Back to Dashboard</Button>
      </div>
    );
  }

  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    quantity: existing?.quantity || '',
    unit: existing?.unit || 'servings',
    category: existing?.category || 'veg',
    allergens: existing?.allergens || [],
    prepTime: existing?.prepTime ? existing.prepTime.slice(0, 16) : new Date().toISOString().slice(0, 16),
    storageConditions: existing?.storageConditions || '',
    location: existing?.location || '',
    pickupDeadline: existing?.pickupDeadline ? existing.pickupDeadline.slice(0, 16) : '',
    imageUrl: existing?.imageUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function toggleAllergen(a) {
    setForm(f => ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter(x => x !== a) : [...f.allergens, a],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Please fix the errors below.'); return; }

    setSubmitting(true);
    const data = { ...form, quantity: Number(form.quantity) };

    if (existing) {
      updateListing(existing.id, data);
      toast.success('Listing updated!');
    } else {
      addListing(data);
      toast.success('Food listed successfully!');
    }
    setSubmitting(false);
    navigate('/donor');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back
      </button>
      <PageHeader title={existing ? 'Edit Food Listing' : 'Add Food Listing'} subtitle="Fill in details accurately — recipients depend on this information." />

      <form onSubmit={handleSubmit} noValidate className="space-y-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <Input id="name" label="Food Name *" placeholder="e.g. Veg Biryani, Bread & Jam Packs" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />

        <Textarea id="description" label="Description *" placeholder="Describe the food, packaging, freshness etc." value={form.description} onChange={e => set('description', e.target.value)} error={errors.description} rows={3} />

        <div className="grid grid-cols-2 gap-4">
          <Input id="quantity" label="Quantity *" type="number" min="1" placeholder="e.g. 30" value={form.quantity} onChange={e => set('quantity', e.target.value)} error={errors.quantity} />
          <Select id="unit" label="Unit" options={UNIT_OPTIONS} value={form.unit} onChange={e => set('unit', e.target.value)} />
        </div>

        <Select id="category" label="Category *" options={CATEGORY_OPTIONS} value={form.category} onChange={e => set('category', e.target.value)} />

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergens (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map(a => (
              <button key={a} type="button"
                onClick={() => toggleAllergen(a)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.allergens.includes(a)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <Input id="prepTime" label="Preparation Time *" type="datetime-local" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} />

        <Textarea id="storageConditions" label="Storage Conditions *" placeholder="e.g. Keep warm. Consume within 4 hours of pickup." value={form.storageConditions} onChange={e => set('storageConditions', e.target.value)} error={errors.storageConditions} rows={2} />

        <Input id="location" label="Pickup Location *" placeholder="e.g. Vijayawada, Near Railway Station" value={form.location} onChange={e => set('location', e.target.value)} error={errors.location} />

        <Input id="pickupDeadline" label="Pickup Deadline *" type="datetime-local" value={form.pickupDeadline} onChange={e => set('pickupDeadline', e.target.value)} error={errors.pickupDeadline} />

        <Input id="imageUrl" label="Image URL (optional)" placeholder="https://..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>⚠️ Food Safety Reminder:</strong> You are responsible for accurate allergen and storage information. This platform does not certify food safety. Ensure food is safe for consumption before listing.
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={submitting}>
            <Save size={15} /> {existing ? 'Save Changes' : 'List Food'}
          </Button>
        </div>
      </form>
    </div>
  );
}
