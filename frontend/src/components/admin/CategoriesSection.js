'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FolderPlus,
  PlusCircle,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../lib/api';
import { setAdminCategories } from '../../store/slices/adminSlice';

export default function CategoriesSection() {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.admin);

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameHindi: '',
    slug: '',
    description: '',
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data?.success) {
        dispatch(setAdminCategories(res.data.categories));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleOpenAddModal = () => {
    setCategoryForm({
      name: '',
      nameHindi: '',
      slug: '',
      description: '',
      order: categories.length + 1,
    });
    setShowAddCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      nameHindi: cat.nameHindi || '',
      slug: cat.slug || '',
      description: cat.description || '',
      order: cat.order ?? 0,
    });
  };

  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/categories', categoryForm);
      if (res.data?.success) {
        setShowAddCategoryModal(false);
        fetchCategories();
      } else {
        alert(res.data?.message || 'Failed to create category');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/categories/${editingCategory._id}`, categoryForm);
      if (res.data?.success) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        alert(res.data?.message || 'Failed to update category');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data?.success) {
        fetchCategories();
      } else {
        alert(res.data?.message || 'Failed to delete category');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-red-500" />
            News Categories & Navigation Hierarchy
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public news sections, bilingual display names, and sorting sequence in the navigation bar.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <PlusCircle className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedCategories.map((cat) => (
            <div
              key={cat._id || cat.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/40 hover:border-slate-700 transition-all flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 uppercase border border-red-800">
                    Priority #{cat.order ?? 0}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/{cat.slug}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                {cat.nameHindi && <p className="text-xs text-slate-400">{cat.nameHindi}</p>}
                {cat.description && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => handleOpenEditCategory(cat)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-700/50 transition-colors"
                  title="Edit Category & Priority"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id || cat.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
              Add News Category
            </h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setCategoryForm({ ...categoryForm, name, slug });
                  }}
                  placeholder="e.g. Technology & Innovation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name (Hindi)</label>
                <input
                  type="text"
                  value={categoryForm.nameHindi}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameHindi: e.target.value })}
                  placeholder="e.g. तकनीक और नवाचार"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. tech-innovation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-[11px] text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short description of this news category..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Edit Category & Priority</span>
              <span className="text-[11px] font-mono text-amber-400">/{editingCategory.slug}</span>
            </h3>
            <form onSubmit={handleEditCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category Name (Hindi)</label>
                <input
                  type="text"
                  value={categoryForm.nameHindi}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameHindi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-[11px] text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Priority / Display Order *</label>
                <input
                  type="number"
                  required
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow"
                >
                  {submitting ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
