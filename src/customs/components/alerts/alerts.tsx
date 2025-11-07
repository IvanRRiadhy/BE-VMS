import Swal, { SweetAlertOptions } from 'sweetalert2';
/**
 * Show confirmation alert before deleting something
 */
export const showConfirmDelete = async (
  title: string = 'Are you sure want to delete?',
  text: string = '',
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    // icon: 'warning',
    imageUrl: '/src/assets/images/logos/BI_Logo.png',
    imageWidth: 100,
    imageHeight: 100,
    iconColor: '#f59e0b',
    background: '#1f2937',
    color: '#f9fafb',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: '<i class="fas fa-trash"></i> Yes',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown',
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp',
    },
    customClass: {
      title: 'swal2-title-custom',
      htmlContainer: 'swal2-text-custom',
    },
  });

  return result.isConfirmed;
};

/**
 * Show success alert
 */
export const showSuccessAlert = async (
  title: string = 'Success!',
  text: string = 'Operation completed.',
): Promise<void> => {
  await Swal.fire({
    title,
    text,
    icon: 'success',
    iconColor: '#10b981', // hijau
    background: '#ffffff', // putih
    color: '#111827', // teks gelap
    confirmButtonColor: '#10b981',
    // confirmButtonText: 'Got it!',
    showCloseButton: true,
    showClass: {
      popup: 'animate__animated animate__fadeInDown',
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp',
    },
    customClass: {
      title: 'swal2-title-custom',
      htmlContainer: 'swal2-text-custom',
    },
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

export const showSwal = (
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
  text: string,
  durationInMs?: number,
  options: Partial<SweetAlertOptions> = {},
) => {
  const configMap: Record<string, any> = {
    success: {
      title: '<span style="color: #16a34a;">Success!</span>',
      imageUrl: '/src/assets/images/logos/BI_Logo.png',
      confirmButtonColor: '#16a34a',
      background: '#fefefe',
      showConfirmButton: false,
    },
    error: {
      title: 'Error!',
      imageUrl: '/src/assets/images/logos/BI_Logo.png',
      confirmButtonColor: '#dc2626',
      background: '#fff',
      showConfirmButton: true,
    },
    warning: {
      title: 'Warning!',
      imageUrl: '/src/assets/images/logos/BI_Logo.png',
      confirmButtonColor: '#f59e0b',
      background: '#fff',
      showConfirmButton: true,
    },
    info: {
      title: 'Information',
      imageUrl: '/src/assets/images/logos/BI_Logo.png',
      confirmButtonColor: '#3b82f6',
      background: '#fff',
      showConfirmButton: true,
    },
    confirm: {
      title: 'Are you sure?',
      imageUrl: '/src/assets/images/logos/BI_Logo.png',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#9ca3af',
      background: '#fff',
    },
  };

  const baseConfig = configMap[type] || {};
  const autoClose = durationInMs ? { timer: durationInMs, timerProgressBar: true } : {};

  // 🧩 Deteksi kalau ada newline (\n) di text
  const isMultiline = text.includes('\n');
  const formattedText = isMultiline
    ? text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('<br>')
    : text;

  const config = {
    ...baseConfig,
    ...(isMultiline ? { html: formattedText } : { text: formattedText }),
    imageWidth: 100,
    imageHeight: 100,
    imageAlt: type,
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-semibold text-gray-800',
      confirmButton: 'rounded-md px-4 py-2 font-medium',
      cancelButton: 'rounded-md px-4 py-2 font-medium',
    },
    ...autoClose,
    ...options,
  };

  return Swal.fire(config);
};
