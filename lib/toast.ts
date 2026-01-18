import { Toast } from 'react-hot-toast';
import toast from 'react-hot-toast';
const option:
  | Partial<
      Pick<
        Toast,
        | 'id'
        | 'icon'
        | 'duration'
        | 'ariaProps'
        | 'className'
        | 'style'
        | 'position'
        | 'iconTheme'
      >
    >
  | undefined = {
  style: {
    padding: '8px 24px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  duration: 3000,
  position: 'top-right',
};

export const toastMessage = {
  success: (message: string) => toast.success(message, option),
  error: (msg: string) => {
    toast.error(msg, option);
  },
};
