import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ClipboardList,
  Lock,
} from 'lucide-react';
import api from '../api/client.js';
import { TASK_STATUSES, formatDate, toInputDate, isOverdue } from '../utils/constants.js';
import { StatusChip, OverdueChip } from '../components/StatusChip.jsx';
import { EmptyState, TableSkeleton } from '../components/States.jsx';
import { Modal, ConfirmDialog } from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMPLOYEE_NAMES = ['Ankit Kumar', 'Hari Krishna', 'Vidya', 'Faisal'];

const blankTask = () => ({
  employeeName: EMPLOYEE_NAMES[0],
  taskTitle: '',
  taskDescription: '',
  taskStatus: 'Not Yet Started',
  taskDate: toInputDate(new Date()),
  expectedCompletionDate: '',
});

// A single task entry sub-form used in the create modal.
const TaskFields = ({ task, onChange, onRemove, removable, index }) => (
  <motion.div
    className="rounded-xl border border-line bg-surface-2 p-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="mb-3 flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-faint">
        Task {index + 1}
      </span>
      {removable && (
        <button
          onClick={onRemove}
          className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-bad/10 hover:text-bad"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Employee Name</label>
        <select
          className="input"
          value={task.employeeName}
          onChange={(e) => onChange({ ...task, employeeName: e.target.value })}
        >
          {EMPLOYEE_NAMES.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Task Status</label>
        <select
          className="input"
          value={task.taskStatus}
          onChange={(e) => onChange({ ...task, taskStatus: e.target.value })}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Task Title</label>
        <input
          className="input"
          value={task.taskTitle}
          placeholder="e.g. API Development"
          onChange={(e) => onChange({ ...task, taskTitle: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Task Description</label>
        <textarea
          className="input min-h-[72px] resize-y"
          value={task.taskDescription}
          placeholder="Describe the task…"
          onChange={(e) => onChange({ ...task, taskDescription: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Task Date</label>
        <input
          type="date"
          className="input"
          value={toInputDate(task.taskDate)}
          onChange={(e) => onChange({ ...task, taskDate: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Expected Delivery Date</label>
        <input
          type="date"
          className="input"
          value={toInputDate(task.expectedCompletionDate)}
          onChange={(e) => onChange({ ...task, expectedCompletionDate: e.target.value })}
        />
      </div>
    </div>
  </motion.div>
);

export const EmployeeRecords = () => {
  const { can } = useAuth();
  const editable = can('Admin', 'Manager');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [drafts, setDrafts] = useState([blankTask()]);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', { params: { limit: 500 } });
      setTasks(res.data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---- Create (multiple) ----
  const openCreate = () => {
    setDrafts([blankTask()]);
    setCreateOpen(true);
  };

  const validateDrafts = () =>
    drafts.every((d) => d.taskTitle.trim() && d.taskDate && d.expectedCompletionDate);

  const saveDrafts = async () => {
    if (!validateDrafts()) {
      toast.error('Each task needs a title, task date and delivery date.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/tasks', drafts);
      toast.success(`${drafts.length} task${drafts.length > 1 ? 's' : ''} created`);
      setCreateOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Edit ----
  const saveEdit = async () => {
    if (!editing.taskTitle.trim()) {
      toast.error('Task title is required.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/tasks/${editing._id}`, editing);
      toast.success('Task updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteId}`);
      toast.success('Task deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Employee Records
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create, edit and remove employee tasks.
          </p>
        </div>
        {editable ? (
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add New Task
          </button>
        ) : (
          <span className="chip bg-surface-2 text-muted">
            <Lock className="h-3.5 w-3.5" /> Read-only access
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks yet"
            hint={editable ? 'Click “Add New Task” to create the first one.' : 'No tasks have been assigned yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Task</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Task Date</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Expected</th>
                  {editable && <th className="px-5 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} className="border-b border-line/60 transition hover:bg-surface-2">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink">{t.employeeName}</p>
                      <p className="text-xs text-faint">{t.department}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{t.taskTitle}</p>
                      <p className="line-clamp-1 max-w-xs text-xs text-muted">
                        {t.taskDescription || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusChip status={t.taskStatus} />
                        {isOverdue(t) && <OverdueChip />}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 font-mono text-xs text-muted md:table-cell">
                      {formatDate(t.taskDate)}
                    </td>
                    <td className="hidden px-5 py-3.5 font-mono text-xs text-muted md:table-cell">
                      {formatDate(t.expectedCompletionDate)}
                    </td>
                    {editable && (
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditing({ ...t })}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-info/10 hover:text-info"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(t._id)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-bad/10 hover:text-bad"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal — multiple tasks */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Tasks" wide>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {drafts.map((d, i) => (
            <TaskFields
              key={i}
              index={i}
              task={d}
              removable={drafts.length > 1}
              onChange={(next) =>
                setDrafts((arr) => arr.map((x, idx) => (idx === i ? next : x)))
              }
              onRemove={() => setDrafts((arr) => arr.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            className="btn-ghost"
            onClick={() => setDrafts((arr) => [...arr, blankTask()])}
          >
            <Plus className="h-4 w-4" />
            Add Another Task
          </button>
          <button className="btn-primary" onClick={saveDrafts} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : `Save ${drafts.length} Task${drafts.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </Modal>

      {/* Edit modal — single task */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Task" wide>
        {editing && (
          <>
            <TaskFields task={editing} index={0} onChange={setEditing} removable={false} />
            <div className="mt-4 flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Update Task'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        title="Delete task"
        message="This will permanently remove the task record. This action cannot be undone."
      />
    </div>
  );
};
