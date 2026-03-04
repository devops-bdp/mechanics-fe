# Confirmation Alerts for Data Changes

This app now includes confirmation alerts when changing/updating data to prevent accidental modifications.

## Available Functions

### `confirmDataChange()`
Shows a confirmation dialog before saving changes to data.

```typescript
import { confirmDataChange } from '@/lib/swal';

// Basic usage
const result = await confirmDataChange();
if (result.isConfirmed) {
  // User clicked "Yes, Save Changes"
  // Proceed with update
} else {
  // User clicked "Cancel"
  // Don't proceed
}

// Custom message
const result = await confirmDataChange(
  'Are you sure you want to update this item?',
  'Confirm Update'
);
```

### `confirmDelete()`
Shows a confirmation dialog before deleting data.

```typescript
import { confirmDelete } from '@/lib/swal';

const result = await confirmDelete(
  'Are you sure you want to delete this item?',
  'Confirm Delete',
  'Item Name' // Optional: item name to display
);
```

## Implementation Examples

### Example 1: Profile Update
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Confirm before saving
  const confirmResult = await confirmDataChange(
    'Are you sure you want to save these profile changes?',
    'Confirm Profile Update'
  );

  if (!confirmResult.isConfirmed) {
    return; // User cancelled
  }

  // Proceed with update
  setIsLoading(true);
  try {
    const response = await apiClient.updateProfile(data);
    // ... handle response
  } catch (error) {
    // ... handle error
  } finally {
    setIsLoading(false);
  }
};
```

### Example 2: Unit Update
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Validation first
  if (!formData.unitCode) {
    await showError('Please fill required fields');
    return;
  }

  // Confirm before saving
  const confirmResult = await confirmDataChange(
    `Are you sure you want to update unit "${formData.unitCode}"?`,
    'Confirm Unit Update'
  );

  if (!confirmResult.isConfirmed) {
    return;
  }

  // Proceed with update
  setIsSubmitting(true);
  try {
    const response = await apiClient.updateUnit(id, formData);
    // ... handle response
  } catch (error) {
    // ... handle error
  } finally {
    setIsSubmitting(false);
  }
};
```

### Example 3: User Update (with conditional confirmation)
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Only confirm for updates, not creates
  if (editingUser) {
    const confirmResult = await confirmDataChange(
      `Are you sure you want to update user "${formData.firstName} ${formData.lastName}"?`,
      'Confirm User Update'
    );

    if (!confirmResult.isConfirmed) {
      return;
    }
  }

  // Proceed with create or update
  setIsSubmitting(true);
  // ... rest of the code
};
```

## Where It's Currently Implemented

✅ **Profile Page** (`app/profile/page.tsx`)
- Confirms before updating user profile

✅ **Edit Unit Modal** (`components/planner/EditUnitModal.tsx`)
- Confirms before updating unit information

✅ **SuperAdmin Users Page** (`app/superadmin/users/page.tsx`)
- Confirms before updating user information (only for updates, not creates)

## Adding to Other Components

To add confirmation alerts to other update operations:

1. Import the function:
```typescript
import { confirmDataChange } from '@/lib/swal';
```

2. Add confirmation before the update:
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  // Add confirmation
  const confirmResult = await confirmDataChange(
    'Your custom message here',
    'Your custom title here'
  );
  
  if (!confirmResult.isConfirmed) {
    return; // User cancelled
  }
  
  // Continue with your existing update logic
  // ...
};
```

## Notes

- Confirmation dialogs use SweetAlert2
- The dialog shows "Yes, Save Changes" (green) and "Cancel" (gray) buttons
- Users can click outside or press Escape to cancel
- Only proceed with the update if `result.isConfirmed` is `true`

