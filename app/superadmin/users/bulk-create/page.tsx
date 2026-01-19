'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { showError, showSuccess } from '@/lib/swal';

interface UserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nrp: string;
  role: string;
  posisi: string;
  phoneNumber: string;
}

export default function BulkCreateUsersPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'csv' | 'manual'>('manual');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [users, setUsers] = useState<UserInput[]>([
    {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      nrp: '',
      role: 'USERS',
      posisi: 'MEKANIK',
      phoneNumber: '',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUser = () => {
    setUsers([
      ...users,
      {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        nrp: '',
        role: 'USERS',
        posisi: 'MEKANIK',
        phoneNumber: '',
      },
    ]);
  };

  const handleRemoveUser = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const handleUserChange = (index: number, field: keyof UserInput, value: string) => {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsers(updatedUsers);
  };

  const parseCSV = (text: string): UserInput[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['email', 'password', 'firstname', 'lastname', 'nrp'];
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.includes(h) && !headers.includes(h.replace('name', ' name'))
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const emailIndex = headers.findIndex((h) => h === 'email');
    const passwordIndex = headers.findIndex((h) => h === 'password');
    const firstNameIndex = headers.findIndex((h) => h === 'firstname' || h === 'first name');
    const lastNameIndex = headers.findIndex((h) => h === 'lastname' || h === 'last name');
    const nrpIndex = headers.findIndex((h) => h === 'nrp');
    const roleIndex = headers.findIndex((h) => h === 'role');
    const posisiIndex = headers.findIndex((h) => h === 'posisi' || h === 'position');
    const phoneNumberIndex = headers.findIndex((h) => h === 'phonenumber' || h === 'phone number');

    const parsedUsers: UserInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.every((v) => !v)) continue; // Skip empty rows

      parsedUsers.push({
        email: values[emailIndex] || '',
        password: values[passwordIndex] || '',
        firstName: values[firstNameIndex] || '',
        lastName: values[lastNameIndex] || '',
        nrp: values[nrpIndex] || '',
        role: values[roleIndex] || 'USERS',
        posisi: values[posisiIndex] || 'MEKANIK',
        phoneNumber: values[phoneNumberIndex] || '',
      });
    }

    return parsedUsers;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showError('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setCsvPreview(parsed);
        setUsers(parsed);
      } catch (error: any) {
        showError(error.message || 'Failed to parse CSV file');
        setCsvFile(null);
        setCsvPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setIsSubmitting(true);

    try {
      // Validate all users
      const validatedUsers = users
        .map((user, index) => {
          if (!user.email || !user.password || !user.firstName || !user.lastName || !user.nrp) {
            throw new Error(`Row ${index + 1}: Missing required fields`);
          }
          if (user.password.length < 6) {
            throw new Error(`Row ${index + 1}: Password must be at least 6 characters`);
          }
          const nrpNum = parseInt(user.nrp);
          if (isNaN(nrpNum) || nrpNum <= 0) {
            throw new Error(`Row ${index + 1}: NRP must be a positive integer`);
          }

          return {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            nrp: nrpNum,
            role: user.role || 'USERS',
            posisi: user.posisi || 'MEKANIK',
            phoneNumber: user.phoneNumber || undefined,
          };
        })
        .filter((user) => user); // Remove any invalid entries

      if (validatedUsers.length === 0) {
        setError('No valid users to create');
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.bulkCreateUsers(validatedUsers);

      if (response.success) {
        setResults(response.data);
        await showSuccess(
          `Bulk create completed! ${response.data.summary.successful} successful, ${response.data.summary.failed} failed.`
        );
      } else {
        setError(response.message || 'Failed to create users');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while creating users');
      await showError(error.message || 'An error occurred while creating users');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SUPERADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Users
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Create Users</h1>
            <p className="mt-2 text-sm text-gray-600">Create multiple users at once using CSV upload or manual input</p>
          </div>

          {/* Mode Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setMode('manual');
                  setCsvFile(null);
                  setCsvPreview([]);
                  setUsers([
                    {
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                      nrp: '',
                      role: 'USERS',
                      posisi: 'MEKANIK',
                      phoneNumber: '',
                    },
                  ]);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                  mode === 'manual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Input
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('csv');
                  setUsers([
                    {
                      email: '',
                      password: '',
                      firstName: '',
                      lastName: '',
                      nrp: '',
                      role: 'USERS',
                      posisi: 'MEKANIK',
                      phoneNumber: '',
                    },
                  ]);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                  mode === 'csv'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                CSV Upload
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'csv' ? (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    CSV format: email,password,firstName,lastName,nrp,role,posisi,phoneNumber
                  </p>
                  <p className="text-xs text-gray-500">
                    Required columns: email, password, firstName, lastName, nrp
                  </p>
                </div>

                {csvPreview.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview ({csvPreview.length} users)
                    </p>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">NRP</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvPreview.map((user, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs">{user.email}</td>
                              <td className="px-3 py-2 text-xs">{user.firstName}</td>
                              <td className="px-3 py-2 text-xs">{user.lastName}</td>
                              <td className="px-3 py-2 text-xs">{user.nrp}</td>
                              <td className="px-3 py-2 text-xs">{user.role}</td>
                              <td className="px-3 py-2 text-xs">{user.posisi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Users to Create</h2>
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                  </button>
                </div>

                <div className="space-y-4">
                  {users.map((user, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">User #{index + 1}</h3>
                        {users.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) => handleUserChange(index, 'email', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="user@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={user.password}
                            onChange={(e) => handleUserChange(index, 'password', e.target.value)}
                            required
                            minLength={6}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Min 6 characters"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={user.firstName}
                            onChange={(e) => handleUserChange(index, 'firstName', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={user.lastName}
                            onChange={(e) => handleUserChange(index, 'lastName', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            NRP <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={user.nrp}
                            onChange={(e) => handleUserChange(index, 'nrp', e.target.value)}
                            required
                            min="1"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={user.role}
                            onChange={(e) => handleUserChange(index, 'role', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="USERS">Users</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPERADMIN">Super Admin</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={user.posisi}
                            onChange={(e) => handleUserChange(index, 'posisi', e.target.value)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="MEKANIK">Mekanik</option>
                            <option value="ELECTRICIAN">Electrician</option>
                            <option value="WELDER">Welder</option>
                            <option value="TYREMAN">Tyreman</option>
                            <option value="GROUP_LEADER_MEKANIK">Group Leader Mekanik</option>
                            <option value="GROUP_LEADER_TYRE">Group Leader Tyre</option>
                            <option value="PLANNER">Planner</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="DEPT_HEAD">Dept Head</option>
                            <option value="MANAGEMENT">Management</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={user.phoneNumber}
                            onChange={(e) => handleUserChange(index, 'phoneNumber', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Results</h2>
                <div className="mb-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Summary:</strong> {results.summary.successful} successful, {results.summary.failed} failed
                    out of {results.summary.total} total
                  </p>
                </div>

                {results.failed.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-red-700 mb-2">Failed ({results.failed.length})</h3>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.failed.map((fail: any, index: number) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs">{fail.index}</td>
                              <td className="px-3 py-2 text-xs">{fail.email}</td>
                              <td className="px-3 py-2 text-xs text-red-600">{fail.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {results.successful.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700 mb-2">Successful ({results.successful.length})</h3>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-green-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">NRP</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Role</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {results.successful.map((user: any, index: number) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs">{user.email}</td>
                              <td className="px-3 py-2 text-xs">
                                {user.firstName} {user.lastName}
                              </td>
                              <td className="px-3 py-2 text-xs">{user.nrp}</td>
                              <td className="px-3 py-2 text-xs">{user.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || users.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? `Creating ${users.length} users...` : `Create ${users.length} User(s)`}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}

