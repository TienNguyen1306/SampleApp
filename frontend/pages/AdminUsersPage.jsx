import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchUsers, createUserRequest, deleteUsersRequest, updateUserRoleRequest } from '../api/users'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './AdminUsersPage.css'

const LIMIT = 10

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // List state
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filter / sort / paging
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  // Selection
  const [selected, setSelected] = useState([])

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', username: '', password: '', role: 'customer' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState(null) // null | 'bulk' | userId

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUsers({ search, role: roleFilter, sortBy, sortDir, page, limit: LIMIT })
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setSelected([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, sortBy, sortDir, page])

  useEffect(() => { loadUsers() }, [loadUsers])

  // Reset to page 1 when filter/search changes
  useEffect(() => { setPage(1) }, [search, roleFilter, sortBy, sortDir])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Sort handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const sortIcon = (field) => {
    if (sortBy !== field) return ' ⇅'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  // Selection
  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    const allIds = users.map((u) => u._id || u.id)
    if (selected.length === allIds.length) {
      setSelected([])
    } else {
      setSelected(allIds)
    }
  }

  // Delete
  const handleDelete = async (ids) => {
    try {
      await deleteUsersRequest(ids)
      showSuccess(t('adminUsers.successDelete'))
      setConfirmDelete(null)
      loadUsers()
    } catch (err) {
      setError(err.message)
      setConfirmDelete(null)
    }
  }

  // Role change
  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRoleRequest(id, newRole)
      showSuccess(t('adminUsers.successRole'))
      setUsers((prev) => prev.map((u) => (u._id === id || u.id === id) ? { ...u, role: newRole } : u))
    } catch (err) {
      setError(err.message)
    }
  }

  // Add user
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    try {
      await createUserRequest(addForm)
      showSuccess(t('adminUsers.successAdd'))
      setShowAddModal(false)
      setAddForm({ name: '', username: '', password: '', role: 'customer' })
      loadUsers()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="au-wrapper">
      {/* Header */}
      <header className="au-header">
        <div className="au-header-inner">
          <button className="back-btn" onClick={() => navigate('/home')}>{t('adminUsers.back')}</button>
          <div className="au-logo">
            <span>🛍️</span>
            <span>ShopVN — {t('adminUsers.title')}</span>
          </div>
          <div className="au-header-right">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="au-main">
        <h1 className="au-title">👥 {t('adminUsers.title')}</h1>

        {/* Toolbar */}
        <div className="au-toolbar">
          <input
            className="au-search"
            placeholder={t('adminUsers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="au-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">{t('adminUsers.filterRole')}</option>
            <option value="admin">{t('adminUsers.roleAdmin')}</option>
            <option value="customer">{t('adminUsers.roleCustomer')}</option>
          </select>
          <div className="au-toolbar-right">
            {selected.length > 0 && (
              <button className="btn-delete-sel" onClick={() => setConfirmDelete('bulk')}>
                🗑️ {t('adminUsers.deleteSelected')} ({selected.length})
              </button>
            )}
            <button className="btn-add-user" onClick={() => setShowAddModal(true)}>
              {t('adminUsers.addUser')}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="au-error">⚠️ {error}</div>}
        {successMsg && <div className="au-success">✅ {successMsg}</div>}

        {/* Table */}
        {loading ? (
          <p className="au-state">{t('adminUsers.loading')}</p>
        ) : users.length === 0 ? (
          <p className="au-state">{t('adminUsers.noUsers')}</p>
        ) : (
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="sortable" onClick={() => handleSort('username')}>
                    {t('adminUsers.colUsername')}{sortIcon('username')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    {t('adminUsers.colName')}{sortIcon('name')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('role')}>
                    {t('adminUsers.colRole')}{sortIcon('role')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('createdAt')}>
                    {t('adminUsers.colCreatedAt')}{sortIcon('createdAt')}
                  </th>
                  <th>{t('adminUsers.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const uid = u._id || u.id
                  const isAdmin = u.username === 'admin'
                  return (
                    <tr key={uid} className={selected.includes(uid) ? 'selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(uid)}
                          onChange={() => toggleSelect(uid)}
                          disabled={isAdmin}
                        />
                      </td>
                      <td>
                        <span className="au-username">{u.username}</span>
                        {isAdmin && <span className="au-protected-badge">🔒</span>}
                      </td>
                      <td>{u.name}</td>
                      <td>
                        <span className={`au-role-badge role-${u.role}`}>
                          {u.role === 'admin' ? t('adminUsers.roleAdmin') : t('adminUsers.roleCustomer')}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="au-actions">
                        {!isAdmin && (
                          <>
                            <select
                              className="au-role-select"
                              value={u.role}
                              onChange={(e) => handleRoleChange(uid, e.target.value)}
                            >
                              <option value="customer">{t('adminUsers.roleCustomer')}</option>
                              <option value="admin">{t('adminUsers.roleAdmin')}</option>
                            </select>
                            <button
                              className="btn-del-one"
                              onClick={() => setConfirmDelete(uid)}
                            >🗑️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="au-pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('adminUsers.prev')}</button>
            <span>{t('adminUsers.page', { page, total: totalPages })}</span>
            <span className="au-total">({total} users)</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>{t('adminUsers.next')}</button>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="au-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="au-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('adminUsers.addModal.title')}</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="au-form-group">
                <label>{t('adminUsers.addModal.name')}</label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="au-form-group">
                <label>{t('adminUsers.addModal.username')}</label>
                <input
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  required
                  placeholder="username123"
                />
              </div>
              <div className="au-form-group">
                <label>{t('adminUsers.addModal.password')}</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  required
                  placeholder="••••••"
                />
              </div>
              <div className="au-form-group">
                <label>{t('adminUsers.addModal.role')}</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
                  <option value="customer">{t('adminUsers.roleCustomer')}</option>
                  <option value="admin">{t('adminUsers.roleAdmin')}</option>
                </select>
              </div>
              {addError && <div className="au-error">⚠️ {addError}</div>}
              <div className="au-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  {t('adminUsers.addModal.cancel')}
                </button>
                <button type="submit" className="btn-submit" disabled={addLoading}>
                  {addLoading ? '...' : t('adminUsers.addModal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="au-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="au-modal au-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️</h2>
            <p>
              {confirmDelete === 'bulk'
                ? t('adminUsers.deleteConfirm', { count: selected.length })
                : t('adminUsers.deleteOne')}
            </p>
            <div className="au-modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>
                {t('adminUsers.addModal.cancel')}
              </button>
              <button
                className="btn-delete-confirm"
                onClick={() =>
                  handleDelete(confirmDelete === 'bulk' ? selected : [confirmDelete])
                }
              >
                🗑️ {t('adminUsers.colActions')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
