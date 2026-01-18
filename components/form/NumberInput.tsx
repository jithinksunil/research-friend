import { InfoOutlined } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

interface PropTypes {
  control: Control<any>;
  name: string;
  placeholder: string;
  noAppend?: boolean;
  disabled?: boolean;
  description?: string;
}

export function NumberInput(props: PropTypes) {
  return (
    <>
      <Controller
        control={props.control}
        name={props.name}
        render={({
          field: { value, onChange },
          fieldState: { invalid, error },
        }) => (
          <div className='flex flex-wrap w-full mb-4'>
            <div className='flex-1 flex'>
              <label>
                <input
                  className={`h-14 block w-full border text-base px-4 py-0 rounded-lg border-solid border-[#C8CFD6] outline-none ${
                    invalid ? 'border border-solid border-[red]' : ''
                  } ${
                    props.noAppend
                      ? ''
                      : 'rounded-tr-none rounded-br-none border-r-0'
                  }`}
                  type='number'
                  name={props.name}
                  onChange={onChange}
                  placeholder={props.placeholder}
                  value={value}
                  autoComplete='off'
                  disabled={props.disabled}
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
              {props.noAppend ? null : (
                <div
                  className={`text-[#818181] border flex justify-center items-center h-14 cursor-pointer mb-2 px-4 py-0 rounded-tl-none rounded-bl-none rounded-lg border-l-0 border-solid border-[#C8CFD6] ${
                    invalid ? 'border border-solid border-[red]' : ''
                  }`}
                >
                  Million
                </div>
              )}
            </div>
            {invalid ? <p className='error'>{error?.message}</p> : null}
          </div>
        )}
      />
    </>
  );
}
