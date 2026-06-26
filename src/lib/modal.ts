type ModalCallback = (state: {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => void;

let modalCallback: ModalCallback | null = null;

export const registerModalCallback = (cb: ModalCallback) => {
  modalCallback = cb;
};

export const showAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (modalCallback) {
      modalCallback({
        isOpen: true,
        type: 'alert',
        message,
        onConfirm: () => resolve(),
        onCancel: () => resolve()
      });
    } else {
      window.alert(message);
      resolve();
    }
  });
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (modalCallback) {
      modalCallback({
        isOpen: true,
        type: 'confirm',
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    } else {
      const result = window.confirm(message);
      resolve(result);
    }
  });
};
