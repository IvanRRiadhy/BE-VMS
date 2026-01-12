import Swal, { SweetAlertOptions } from 'sweetalert2';
import BI_LOGO from 'src/assets/images/logos/BI_Logo.png';

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
    // imageUrl: '/src/assets/images/logos/BI_Logo.png',
    icon: 'warning',
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
    iconColor: '#10b981',
    background: '#ffffff',
    color: '#111827',
    confirmButtonColor: '#10b981',
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

const imageSrc = new URL(BI_LOGO, import.meta.url).href;

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
      // imageUrl: '/assets/images/BI_Logo.png',
      icon: 'success',
      // imageUrl: BI_LOGO,
      confirmButtonColor: '#16a34a',
      background: '#fefefe',
      showConfirmButton: false,
    },
    error: {
      title: 'Error!',
      // imageUrl: '/assets/images/BI_Logo.png',
      icon: 'error',
      // imageUrl: BI_LOGO,
      confirmButtonColor: '#dc2626',
      background: '#fff',
      showConfirmButton: false,
      customClass: {
        title: 'swal-title-red',
      },
    },
    warning: {
      title: 'Warning!',
      // imageUrl: '/assets/images/BI_Logo.png',
      icon: 'warning',
      // imageUrl: BI_LOGO,
      confirmButtonColor: '#f59e0b',
      background: '#fff',
      showConfirmButton: true,
    },
    info: {
      title: 'Information',
      // imageUrl: '/assets/images/BI_Logo.png',
      icon: 'info',
      // imageUrl: BI_LOGO,
      confirmButtonColor: '#3b82f6',
      background: '#fff',
      showConfirmButton: true,
    },
    confirm: {
      // title: 'Are you sure?',
      // imageUrl: '/assets/images/BI_Logo.png',
      icon: 'question',
      // imageUrl: BI_LOGO,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: false,
      confirmButtonColor: '#16a34a',
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

  const config: SweetAlertOptions = {
    ...baseConfig,
    ...(isMultiline ? { html: formattedText } : { text: formattedText }),
    imageWidth: 100,
    imageHeight: 100,
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    heightAuto: false,
    target: document.fullscreenElement ?? document.body,
    backdrop: true,
    customClass: {
      ...baseConfig.customClass,
      popup: 'rounded-2xl shadow-2xl',
      title: `${baseConfig.customClass?.title || ''} text-lg font-semibold`,
      confirmButton: 'rounded-md px-4 py-2 font-medium',
      cancelButton: 'rounded-md px-4 py-2 font-medium',
      closeButton: 'swal-close-red',
    },
    ...autoClose,
    ...options,
  };

  return Swal.fire(config);
};

export const showDialogError = (htmlContent: string) => {
  return Swal.fire({
    title: '<span style="color:#dc2626;">Error</span>',
    html: htmlContent,
    width: '700px', // ukuran lebih besar
    padding: '20px',
    background: '#fff',
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Close',
    showCloseButton: true,
    imageUrl: '/assets/images/BI_Logo.png',
    imageWidth: 100,
    imageHeight: 100,
    customClass: {
      popup: 'rounded-2xl shadow-2xl',
      title: 'text-lg font-semibold text-gray-800',
      confirmButton: 'rounded-md px-4 py-2 font-medium',
    },
  });
};
