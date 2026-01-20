'use client';

import { useState, useEffect, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { showError, showSuccess, showConfirm } from '@/lib/swal';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nrp: number;
  role: string;
  posisi: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    nrp: '',
    role: 'USERS',
    posisi: 'MEKANIK',
    phoneNumber: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    posisi: '',
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.currentPage, filters]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.posisi) params.posisi = filters.posisi;

      const response = await apiClient.getAllUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || pagination);
        // Clear selection when users change (e.g., pagination, filters)
        setSelectedUsers(new Set());
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nrp: user.nrp.toString(),
      role: user.role,
      posisi: user.posisi,
      phoneNumber: user.phoneNumber || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      'Are you sure you want to delete this user? This action cannot be undone.',
      'Delete User',
      'Yes, delete it',
      'Cancel'
    );
    
    if (!result.isConfirmed) return;

    try {
      const response = await apiClient.deleteUser(id);
      if (response.success) {
        await showSuccess('User deleted successfully!');
        loadUsers();
        setSelectedUsers(new Set());
      } else {
        await showError(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      await showError('Please select at least one user to delete');
      return;
    }

    const result = await showConfirm(
      `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`,
      'Bulk Delete Users',
      'Yes, delete them',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    setIsBulkDeleting(true);

    try {
      const userIds = Array.from(selectedUsers);
      const response = await apiClient.bulkDeleteUsers(userIds);

      if (response.success) {
        await showSuccess(
          `Bulk delete completed! ${response.data.summary.successful} successful, ${response.data.summary.failed} failed.`
        );
        setSelectedUsers(new Set());
        loadUsers();
      } else {
        await showError(response.message || 'Failed to delete users');
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        const updateData: any = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nrp: parseInt(formData.nrp),
          role: formData.role,
          posisi: formData.posisi,
          phoneNumber: formData.phoneNumber || undefined,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await apiClient.updateUser(editingUser.id, updateData);
        if (response.success) {
          setIsModalOpen(false);
          setEditingUser(null);
          setFormData({
            email: '',
            firstName: '',
            lastName: '',
            nrp: '',
            role: 'USERS',
            posisi: 'MEKANIK',
            phoneNumber: '',
            password: '',
          });
          await showSuccess('User updated successfully!');
          loadUsers();
        } else {
          await showError(response.message || 'Failed to update user');
        }
      } else {
        // Create new user
        const createData: any = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          nrp: parseInt(formData.nrp),
          role: formData.role,
          posisi: formData.posisi,
          phoneNumber: formData.phoneNumber || undefined,
          password: formData.password,
        };

        const response = await apiClient.createAccount(createData);
        if (response.success) {
          setIsModalOpen(false);
          setFormData({
            email: '',
            firstName: '',
            lastName: '',
            nrp: '',
            role: 'USERS',
            posisi: 'MEKANIK',
            phoneNumber: '',
            password: '',
          });
          await showSuccess('User created successfully!');
          loadUsers();
        } else {
          await showError(response.message || 'Failed to create user');
        }
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedPosisi={["DEPT_HEAD", "MANAGEMENT"]} allowedRoles={['SUPERADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">User Management</h1>
            <div className="flex space-x-3">
              <a
                href="/superadmin/users/bulk-create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Bulk Create
              </a>
              <a
                href="/superadmin/users/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create User
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by name, email, or NRP"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USERS">Users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={filters.posisi}
                  onChange={(e) => setFilters({ ...filters, posisi: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">All Positions</option>
                  <option value="MEKANIK">Mekanik</option>
                  <option value="PLANNER">Planner</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="DEPT_HEAD">Dept Head</option>
                  <option value="MANAGEMENT">Management</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {selectedUsers.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedUsers.size} user(s) selected
                    </span>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedUsers.size === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBulkDeleting ? 'Deleting...' : `Delete ${selectedUsers.size} User(s)`}
                  </button>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              NRP: {user.nrp} | Role: {user.role} | Position: {user.posisi}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Edit Modal */}
          {isModalOpen && editingUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NRP</label>
                      <input
                        type="number"
                        value={formData.nrp}
                        onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="USERS">Users</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPERADMIN">Super Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <select
                          value={formData.posisi}
                          onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="MEKANIK">Mekanik</option>
                          <option value="PLANNER">Planner</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="DEPT_HEAD">Dept Head</option>
                          <option value="MANAGEMENT">Management</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave empty to keep current password"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingUser(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

