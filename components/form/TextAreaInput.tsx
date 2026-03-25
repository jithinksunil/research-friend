import { InfoOutlined } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
interface PropTypes<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  placeholder: string;
  inputContainerClass?: string;
  disabled?: boolean;
  description?: string;
}

export function TextAreaInput<TFieldValues extends FieldValues>(props: PropTypes<TFieldValues>) {
  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field: { onChange, value }, fieldState: { invalid, error } }) => (
        <div
          className={`h-[220px] md:h-full grid grid-rows-[1fr_auto] pb-4 ${
            props.inputContainerClass || ''
          }`}
        >
          <label className={`h-full`}>
            <textarea
              className={`focus:outline-none resize-none block w-full border text-base rounded-lg h-full overflow-hidden p-4 border-solid ${
                invalid ? 'border-[red]' : 'border-[#C8CFD6]'
              }`}
              name={props.name}
              onChange={onChange}
              value={value}
              placeholder={props.placeholder}
              autoComplete="off"
              disabled={props.disabled}
            />
            <p className="custom_label">
              {props.placeholder}{' '}
              {props.description ? (
                <Tooltip className="tooltip" title={props.description} placement="right">
                  <InfoOutlined
                    fontSize="small"
                    className="cursor-pointer hover:text-primary transition-all duration-200 ml-1 text-[18px]"
                  />
                </Tooltip>
              ) : null}
            </p>
          </label>
          {invalid ? <p className="error pt-2">{error?.message}</p> : null}
        </div>
      )}
    />
  );
}
