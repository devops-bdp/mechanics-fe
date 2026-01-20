'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { showError, showSuccess } from '@/lib/swal';
import Papa from 'papaparse';
import { UNIT_TYPES, UNIT_BRANDS, UNIT_STATUSES } from '@/lib/constants/enums';

interface UnitData {
  unitType: string;
  unitBrand: string;
  unitCode: string;
  unitDescription?: string;
  unitImage?: string;
  unitStatus?: string;
}

interface BulkCreateResult {
  success: boolean;
  message: string;
  unitCode?: string;
}

export default function BulkCreateUnitsPage() {
  const router = useRouter();
  const [unitsData, setUnitsData] = useState<UnitData[]>([
    { unitType: 'PMVV', unitBrand: 'VOLVO', unitCode: '', unitStatus: 'ACTIVE' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<BulkCreateResult[] | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<UnitData[] | null>(null);
  const [inputMode, setInputMode] = useState<'manual' | 'csv'>('manual');

  const handleManualInputChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newUnitsData = [...unitsData];
    newUnitsData[index] = { ...newUnitsData[index], [name]: value };
    setUnitsData(newUnitsData);
  };

  const handleAddUnit = () => {
    setUnitsData([...unitsData, { unitType: 'PMVV', unitBrand: 'VOLVO', unitCode: '', unitStatus: 'ACTIVE' }]);
  };

  const handleRemoveUnit = (index: number) => {
    const newUnitsData = unitsData.filter((_, i) => i !== index);
    setUnitsData(newUnitsData);
  };

  const handleCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Basic validation for required headers
          const requiredHeaders = ['unitType', 'unitBrand', 'unitCode'];
          const missingHeaders = requiredHeaders.filter(header => !results.meta.fields?.includes(header));
          if (missingHeaders.length > 0) {
            showError(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
            setCsvPreview(null);
            setCsvFile(null);
            return;
          }
          setCsvPreview(results.data as UnitData[]);
        },
        error: (error) => {
          showError(`Failed to parse CSV: ${error.message}`);
          setCsvPreview(null);
          setCsvFile(null);
        }
      });
    } else {
      setCsvFile(null);
      setCsvPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResults(null);
    setIsSubmitting(true);

    let dataToSubmit: UnitData[] = [];
    if (inputMode === 'manual') {
      dataToSubmit = unitsData;
    } else if (inputMode === 'csv' && csvPreview) {
      dataToSubmit = csvPreview;
    }

    if (dataToSubmit.length === 0) {
      await showError('No unit data to submit.');
      setIsSubmitting(false);
      return;
    }

    if (dataToSubmit.length > 100) {
      await showError('Maximum 100 units can be created in a single bulk request.');
      setIsSubmitting(false);
      return;
    }

    // Frontend validation before sending to backend
    const errors: string[] = [];
    dataToSubmit.forEach((unit, index) => {
      if (!unit.unitType || !unit.unitBrand || !unit.unitCode) {
        errors.push(`Row ${index + 1}: Missing required fields (unitType, unitBrand, unitCode).`);
      }
      if (unit.unitType && !UNIT_TYPES.includes(unit.unitType)) {
        errors.push(`Row ${index + 1}: Invalid unitType. Valid types are: ${UNIT_TYPES.join(', ')}`);
      }
      if (unit.unitBrand && !UNIT_BRANDS.includes(unit.unitBrand)) {
        errors.push(`Row ${index + 1}: Invalid unitBrand. Valid brands are: ${UNIT_BRANDS.join(', ')}`);
      }
      if (unit.unitStatus && !UNIT_STATUSES.includes(unit.unitStatus)) {
        errors.push(`Row ${index + 1}: Invalid unitStatus. Valid statuses are: ${UNIT_STATUSES.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      await showError(`Validation Errors: ${errors.join('; ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.bulkCreateUnits(dataToSubmit.map(unit => ({
        unitType: unit.unitType,
        unitBrand: unit.unitBrand,
        unitCode: unit.unitCode,
        unitDescription: unit.unitDescription || undefined,
        unitImage: unit.unitImage || undefined,
        unitStatus: unit.unitStatus || 'ACTIVE',
      })));

      if (response.success) {
        await showSuccess(response.message || 'Bulk unit creation completed!');
        setResults(response.data);
        // Optionally clear form or redirect
        if (inputMode === 'manual') {
          setUnitsData([{ unitType: 'PMVV', unitBrand: 'VOLVO', unitCode: '', unitStatus: 'ACTIVE' }]);
        } else {
          setCsvFile(null);
          setCsvPreview(null);
        }
      } else {
        await showError(response.message || 'Bulk unit creation failed!');
        setResults(response.data);
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred during bulk unit creation');
      setResults(error.response?.data?.data || null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedPosisi={['PLANNER']} allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Units
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Create Units</h1>
            <p className="mt-2 text-sm text-gray-600">Create multiple units at once.</p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Input Mode:</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    inputMode === 'manual'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Manual Input
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('csv')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    inputMode === 'csv'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  CSV Upload
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {inputMode === 'manual' && (
                <div className="space-y-4">
                  {unitsData.map((unit, index) => (
                    <div key={index} className="border p-4 rounded-md bg-gray-50 relative">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Unit #{index + 1}</h3>
                      {unitsData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveUnit(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`unitType-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            id={`unitType-${index}`}
                            name="unitType"
                            value={unit.unitType}
                            onChange={(e) => handleManualInputChange(index, e)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {UNIT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`unitBrand-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Brand <span className="text-red-500">*</span>
                          </label>
                          <select
                            id={`unitBrand-${index}`}
                            name="unitBrand"
                            value={unit.unitBrand}
                            onChange={(e) => handleManualInputChange(index, e)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {UNIT_BRANDS.map((brand) => (
                              <option key={brand} value={brand}>
                                {brand}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`unitCode-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id={`unitCode-${index}`}
                            name="unitCode"
                            value={unit.unitCode}
                            onChange={(e) => handleManualInputChange(index, e)}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor={`unitStatus-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Status
                          </label>
                          <select
                            id={`unitStatus-${index}`}
                            name="unitStatus"
                            value={unit.unitStatus || 'ACTIVE'}
                            onChange={(e) => handleManualInputChange(index, e)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {UNIT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`unitDescription-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Description
                          </label>
                          <input
                            type="text"
                            id={`unitDescription-${index}`}
                            name="unitDescription"
                            value={unit.unitDescription || ''}
                            onChange={(e) => handleManualInputChange(index, e)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`unitImage-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Image URL
                          </label>
                          <input
                            type="url"
                            id={`unitImage-${index}`}
                            name="unitImage"
                            value={unit.unitImage || ''}
                            onChange={(e) => handleManualInputChange(index, e)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Unit
                  </button>
                </div>
              )}

              {inputMode === 'csv' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Upload CSV File
                    </label>
                    <input
                      type="file"
                      id="csvFile"
                      accept=".csv"
                      onChange={handleCsvFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      CSV must contain 'unitType', 'unitBrand', 'unitCode' columns.
                    </p>
                  </div>

                  {csvPreview && csvPreview.length > 0 && (
                    <div className="border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        CSV Preview ({csvPreview.length} units)
                      </h3>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(csvPreview[0]).map((key) => (
                              <th
                                key={key}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvPreview.map((unit, index) => (
                            <tr key={index}>
                              {Object.values(unit).map((value, i) => (
                                <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (inputMode === 'csv' && !csvFile)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Units...' : 'Create Units'}
                </button>
              </div>
            </form>

            {results && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Creation Results</h2>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        result.success
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? '✅ Success:' : '❌ Failed:'} {result.message}
                      </p>
                      {result.unitCode && (
                        <p className="text-xs text-gray-600 mt-1">Unit Code: {result.unitCode}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

