import { ReactNode } from 'react';
import { Button } from '@mui/material';
import { Loader } from './Loader';

interface PropTypes {
  type: 'button' | 'submit';
  children: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  id?: string;
}

export function PrimaryButton(props: PropTypes) {
  return (
    <Button
      id={props.id}
      size={props.size || 'medium'}
      type={props.type}
      className={`relative primaryButton !rounded-lg ${
        props.className || ''
      } !bg-primary`}
      disabled={props.isDisabled}
      onClick={props.onClick}
    >
      <span
        className={`${
          props.isLoading ? 'invisible' : 'visible'
        }  text-inherit inherit`}
      >
        {props.children}
      </span>
      <span className={`${props.isLoading ? '' : 'hidden'} absolute`}>
        <Loader />
      </span>
    </Button>
  );
}
