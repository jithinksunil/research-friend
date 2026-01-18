import { ReactNode } from 'react';
import { Control, Controller } from 'react-hook-form';
interface PropTypes {
  control: Control<any>;
  name: string;
  label: string | ReactNode;
  disabled?: boolean;
  labelClassName?: string;
  inputContainer?: string;
}

export function CheckBoxInput(props: PropTypes) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({
        field: { onChange, value },
        fieldState: { invalid, error },
      }) => (
        <div className={`mb-4 ${props?.inputContainer || ''}`}>
          <label className='flex items-center [&_p]:text-base [&_p]:cursor-pointer'>
            <input
              type='checkbox'
              name={props.name}
              onChange={onChange}
              checked={value}
              disabled={props.disabled}
              className='h-4 w-4 accent-[#6f0652] mr-2 rounded-[50%]'
            />
            <p className={props?.labelClassName}>{props.label}</p>
          </label>
          {invalid ? <p className='error'>{error?.message}</p> : null}
        </div>
      )}
    />
  );
}
