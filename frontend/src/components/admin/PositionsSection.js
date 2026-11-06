'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layers,
  PlusCircle,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../lib/api';
import { setPositions } from '../../store/slices/adminSlice';

export default function PositionsSection() {
  const dispatch = useDispatch();
  const { positions } = useSelector((state) => state.admin);

  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [positionForm, setPositionForm] = useState({
    title: '',
    committeeLevel: 'National',
    committeeName: 'A. National Executive Committee',
    maxSeats: '1',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPositions = async () => {
    try {
      const res = await api.get('/positions');
      if (res.data?.success) {
        dispatch(setPositions(res.data.positions));
      }
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  };

  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/positions', positionForm);
      if (res.data?.success) {
        setShowAddPositionModal(false);
        setPositionForm({
          title: '',
          committeeLevel: 'National',
          committeeName: 'A. National Executive Committee',
          maxSeats: '1',
        });
        fetchPositions();
      } else {
        alert(res.data?.message || 'Failed to create position');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating position');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePosition = async (posId) => {
    if (!window.confirm('Are you sure you want to delete this position?')) return;
    try {
      const res = await api.delete(`/positions/${posId}`);
      if (res.data?.success) {
        fetchPositions();
      } else {
        alert(res.data?.message || 'Failed to delete position');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting position');
    }
  };

  const handleResetDefaultPositions = async () => {
    if (
      !window.confirm(
        'Do you want to reset all positions to the official sanctioned committee hierarchy (Tiers A to F and Press)?'
      )
    )
      return;
    try {
      const res = await api.post('/positions/reset-defaults');
      if (res.data?.success) {
        dispatch(setPositions(res.data.positions));
        alert('Default sanctioned committees and positions restored!');
      } else {
        alert(res.data?.message || 'Failed to reset positions');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            Dynamic Committee & Sanctioned Positions Management
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Admins can add new positions, modify allowed seats across tiers, or restore the sanctioned hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPositionModal(true)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" /> Add Custom Position
          </button>
          <button
            onClick={handleResetDefaultPositions}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-500" /> Restore Sanctioned Hierarchy
          </button>
        </div>
      </div>

      {/* Positions list grouped by level */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        {['National', 'State', 'District', 'Block', 'Panchayat', 'Ward', 'Press'].map((lvl) => {
          const posInLevel = positions.filter((p) => p.committeeLevel === lvl);
          if (posInLevel.length === 0) return null;

          return (
            <div key={lvl}>
              <div className="bg-slate-800/80 text-white px-3.5 py-2 rounded-lg flex justify-between items-center mb-2.5 border border-slate-700">
                <span className="font-bold text-xs uppercase tracking-wide">
                  {posInLevel[0]?.committeeName || `${lvl} Committee`}
                </span>
                <span className="text-[11px] text-amber-400 font-bold">
                  Positions: {posInLevel.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {posInLevel.map((pos) => (
                  <div
                    key={pos._id || pos.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-800/40 hover:border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{pos.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        Sanctioned Seats: <strong className="text-red-400">{pos.maxSeats}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePosition(pos._id || pos.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/50"
                      title="Delete Position"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Position Modal */}
      {showAddPositionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 border-b border-slate-800 pb-2">
              Add Custom Position to Tier
            </h3>
            <form onSubmit={handleAddPositionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={positionForm.title}
                  onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })}
                  placeholder="e.g. Senior Vice President"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Committee Tier *</label>
                <select
                  value={positionForm.committeeLevel}
                  onChange={(e) => {
                    const lvl = e.target.value;
                    let cName = `${lvl} Committee`;
                    if (lvl === 'National') cName = 'A. National Executive Committee';
                    if (lvl === 'State') cName = 'B. State Executive Committee';
                    if (lvl === 'District') cName = 'C. District Executive Committee';
                    if (lvl === 'Block') cName = 'D. Block / Taluka Committee';
                    if (lvl === 'Panchayat') cName = 'E. Gram Panchayat Committee';
                    if (lvl === 'Ward') cName = 'F. Ward Committee';
                    if (lvl === 'Press') cName = 'Editorial & Field Reporting Team';

                    setPositionForm({
                      ...positionForm,
                      committeeLevel: lvl,
                      committeeName: cName,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="National">National</option>
                  <option value="State">State</option>
                  <option value="District">District</option>
                  <option value="Block">Block</option>
                  <option value="Panchayat">Panchayat</option>
                  <option value="Ward">Ward</option>
                  <option value="Press">Press</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Sanctioned Seats</label>
                <input
                  type="text"
                  value={positionForm.maxSeats}
                  onChange={(e) => setPositionForm({ ...positionForm, maxSeats: e.target.value })}
                  placeholder="1, 2, 5–11, Open"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPositionModal(false)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
