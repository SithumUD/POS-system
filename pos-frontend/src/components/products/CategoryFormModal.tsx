import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { useStore } from '../../contexts/StoreContext';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function CategoryFormModal({ open, onClose }: CategoryFormModalProps) {
  const { createCategory, categories } = useStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await createCategory({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || null,
        description: description.trim() || undefined,
      } as any);

      setLoading(false);
      setName('');
      setSlug('');
      setParentId('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to create category on backend.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-md"
      title="Add Category"
      subtitle="Create a new category or department for product classification."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating…' : 'Create Category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Category Name" error={error}>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Beverages, Bakery, Dairy"
            autoFocus
          />
        </Field>

        <Field label="URL Slug" hint="Auto-generated identifier used in API routes and filters.">
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="beverages"
            className="font-mono"
          />
        </Field>

        <Field label="Parent Category (Optional)" hint="Select a parent department to create a sub-category hierarchy.">
          <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None (Top-Level Department)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Description (Optional)">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short category summary or department notes"
          />
        </Field>
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
