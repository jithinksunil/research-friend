import { InfoOutlined } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

interface PropTypes {
  control: Control<any>;
  name: string;
  placeholder: string;
  disabled?: boolean;
  inputContainer?: string;
  description?: string;
}

export function TextInput(props: PropTypes) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({
        field: { onChange, value },
        fieldState: { invalid, error },
      }) => (
        <div className={`w-full mb-4 ${props?.inputContainer || ''}`}>
          <label>
            <input
              className={`h-14 block w-full border text-sm md:text-base px-4 py-0 rounded-lg border-solid border-[#c8cfd6] outline-none ${
                invalid ? 'border border-solid border-[red]' : ''
              }`}
              type='text'
              name={props.name}
              onChange={onChange}
              value={value}
              placeholder={props.placeholder}
              disabled={props.disabled}
              autoComplete='off'
            />
            <p className='custom_label'>
              {props.placeholder}{' '}
              {props.description ? (
                <Tooltip
                  className='tooltip'
                  title={props.description}
                  placement='right'
                >
                  <InfoOutlined
                    fontSize='small'
                    className='cursor-pointer hover:text-primary transition-all duration-200 ml-1 text-[18px]'
                  />
                </Tooltip>
              ) : null}
            </p>
          </label>
          {invalid ? <p className={`error pt-2`}>{error?.message}</p> : null}
        </div>
      )}
    />
  );
}
