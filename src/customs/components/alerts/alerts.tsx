import Swal from 'sweetalert2';
/**
 * Show confirmation alert before deleting something
 */
export const showConfirmDelete = async (
  title: string = 'Are you sure?',
  text: string = 'This action cannot be undone!',
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    iconColor: '#f59e0b',
    background: '#1f2937',
    color: '#f9fafb',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: '<i class="fas fa-trash"></i> Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown',
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp',
    },
  });

  return result.isConfirmed;
};

/**
 * Show success alert
 */
export const showSuccessAlert = (
  message: string = 'Success!',
  text: string = 'Operation completed.',
): void => {
  Swal.fire({
    title: message,
    text,
    icon: 'success',
    background: '#ecfdf5',
    iconColor: '#10b981',
    confirmButtonColor: '#10b981',
    confirmButtonText: 'Got it!',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};
/**
 * Show error alert
 */
export const showErrorAlert = (
  message: string = 'Error!',
  text: string = 'Something went wrong.',
): void => {
  Swal.fire({
    title: message,
    text,
    icon: 'error',
    background: '#fef2f2',
    iconColor: '#ef4444',
    confirmButtonColor: '#ef4444',
  });
};
