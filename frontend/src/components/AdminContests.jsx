import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { adminContestsApi } from '../features/contests/contests.api';
import { Plus, Edit, Trash2, Eye, Send, X } from 'lucide-react';

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    problems: [],
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [attemptsModal, setAttemptsModal] = useState(null);

  const fetchContests = async () => {
    try {
      const { data } = await adminContestsApi.getContests();
      setContests(data);
    } catch (err) {
      setError('Failed to fetch contests');
      console.error(err);
    }
  };

  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      console.error('Failed to fetch problems', err);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchContests(), fetchProblems()]);
      setLoading(false);
    })();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      startTime: '',
      duration: 60,
      problems: [],
    });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    const start = c.startTime ? new Date(c.startTime).toISOString().slice(0, 16) : '';
    setForm({
      title: c.title || '',
      description: c.description || '',
      startTime: start,
      duration: c.duration ?? 60,
      problems: (c.problems || []).map((p) => (typeof p === 'object' ? p._id : p)),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!form.startTime) {
      setError('Start time is required');
      return;
    }
    if (!form.duration || form.duration < 1) {
      setError('Duration must be at least 1 minute');
      return;
    }
    setSubmitLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startTime: new Date(form.startTime).toISOString(),
        duration: Number(form.duration),
        problems: form.problems,
      };
      if (editingId) {
        await adminContestsApi.update(editingId, payload);
      } else {
        await adminContestsApi.create(payload);
      }
      await fetchContests();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contest');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePublish = async (contestId, publish) => {
    try {
      await adminContestsApi.publish(contestId, publish);
      await fetchContests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update publish status');
    }
  };

  const handleDelete = async (contestId) => {
    if (!window.confirm('Delete this contest? All attempts and submissions will be removed.')) return;
    try {
      await adminContestsApi.delete(contestId);
      setContests(contests.filter((c) => c._id !== contestId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contest');
    }
  };

  const toggleProblem = (problemId) => {
    setForm((prev) => ({
      ...prev,
      problems: prev.problems.includes(problemId)
        ? prev.problems.filter((id) => id !== problemId)
        : [...prev.problems, problemId],
    }));
  };

  const fetchAttempts = async (contestId) => {
    try {
      const { data } = await adminContestsApi.getAttempts(contestId);
      setAttemptsModal({ contestId, attempts: data });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attempts');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="btn btn-ghost btn-sm">← Admin</NavLink>
          <h1 className="text-3xl font-bold">Manage Contests</h1>
        </div>
        <button type="button" className="btn btn-primary gap-2" onClick={openCreate}>
          <Plus size={20} />
          Create Contest
        </button>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Start</th>
              <th>Duration</th>
              <th>Problems</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contests.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-base-content/70 py-8">
                  No contests yet. Create one and add problems from the list.
                </td>
              </tr>
            )}
            {contests.map((c, i) => (
              <tr key={c._id}>
                <th>{i + 1}</th>
                <td className="font-medium">{c.title}</td>
                <td className="text-sm">{c.startTime ? new Date(c.startTime).toLocaleString() : '–'}</td>
                <td>{c.duration ?? 0} min</td>
                <td>{(c.problems || []).length}</td>
                <td>
                  <span className={`badge ${c.isPublished ? 'badge-success' : 'badge-ghost'}`}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => openEdit(c)} title="Edit">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm gap-1 ${c.isPublished ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handlePublish(c._id, !c.isPublished)}
                    >
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => fetchAttempts(c._id)} title="View attempts">
                      <Eye size={16} />
                      Attempts
                    </button>
                    <button type="button" className="btn btn-error btn-sm gap-1" onClick={() => handleDelete(c._id)}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">{editingId ? 'Edit Contest' : 'Create Contest'}</h3>
            <p className="text-sm text-base-content/70 mb-4">
              Add problems to the contest by selecting them below. Only existing problems from the problem set can be added.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Title</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Contest title"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Description (optional)</span></label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Start time</span></label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Duration (minutes)</span></label>
                  <input
                    type="number"
                    min={1}
                    className="input input-bordered w-full"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Problems in contest</span></label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-base-200/50">
                  {problems.length === 0 && <p className="text-sm text-base-content/70">No problems in the platform. Create problems first under Admin → Create Problem.</p>}
                  <ul className="space-y-2">
                    {problems.map((p) => (
                      <li key={p._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={form.problems.includes(p._id)}
                          onChange={() => toggleProblem(p._id)}
                        />
                        <span className="text-sm flex-1">{p.title}</span>
                        <span className={`badge badge-sm ${p.difficulty === 'easy' ? 'badge-success' : p.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                          {p.difficulty}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-base-content/60 mt-1">Selected: {form.problems.length} problem(s)</p>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? <span className="loading loading-spinner loading-sm" /> : null}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeModal}>
            <button type="button">close</button>
          </form>
        </dialog>
      )}

      {/* Attempts modal */}
      {attemptsModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Contest attempts</h3>
            <p className="text-sm text-base-content/70 mb-4">Total: {attemptsModal.attempts.length}</p>
            <div className="overflow-x-auto max-h-80">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>End time</th>
                  </tr>
                </thead>
                <tbody>
                  {attemptsModal.attempts.map((a, i) => (
                    <tr key={a._id}>
                      <td>{i + 1}</td>
                      <td>{a.userId?.firstName} {a.userId?.lastName} ({a.userId?.emailId})</td>
                      <td>{a.score}</td>
                      <td><span className="badge badge-ghost badge-sm">{a.status}</span></td>
                      <td className="text-xs">{a.endTime ? new Date(a.endTime).toLocaleString() : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setAttemptsModal(null)}>Close</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setAttemptsModal(null)}>
            <button type="button">close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
