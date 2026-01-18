import { Control, Controller } from 'react-hook-form';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface PropTypes {
  control: Control<any>;
  name: string;
  placeholder: string;
  inputContainer?: string;
}

export function PasswordInput(props: PropTypes) {
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({
        field: { onChange, value },
        fieldState: { invalid, error },
      }) => (
        <div
          className={`w-full mb-4 ${props?.inputContainer || ''}`}
        >
          <div className='flex'>
            <label>
              <input
                className={`h-14 block w-full border text-base px-4 py-0 rounded-lg border-solid border-[#c8cfd6] outline-none rounded-tr-none rounded-br-none border-r-0 ${
                  invalid ? 'border border-solid border-[red]' : ''
                }`}
                type={show ? 'text' : 'password'}
                name={props.name}
                onChange={onChange}
                value={value}
                placeholder={props.placeholder}
                autoComplete='off'
              />
              <p className='custom_label'>{props.placeholder}</p>
            </label>
            <div
              onClick={() => {
                setShow((prev) => !prev);
              }}
              className='border flex justify-center items-center cursor-pointer px-4 py-0 rounded-tl-none rounded-bl-none rounded-lg border-l-0 border-solid border-[#c8cfd6]'
            >
              {show ? <VisibilityOff /> : <Visibility />}
            </div>
          </div>
          {invalid ? (
            <p className={`error pt-2`}>{error?.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}
