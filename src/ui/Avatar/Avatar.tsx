import { forwardRef } from 'react';

import cn from 'classnames';

import avatarClasses from './Avatar.module.scss';

export const avatarProps = {
  $size: ['sm', 'md', 'lg'],
  $radius: ['sm', 'md', 'lg']
} as const;

export interface AvatarProps
  extends Pick<
    React.ComponentPropsWithRef<'img'>,
    'src' | 'alt' | 'className' | 'ref'
  > {
  $size?: typeof avatarProps.$size[number];
  $radius?: typeof avatarProps.$radius[number];
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
  { $size, $radius, className, ...props },
  ref
) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      ref={ref}
      className={cn(
        {
          [avatarClasses.radiusSm]: $radius === 'sm',
          [avatarClasses.radiusMd]: $radius === 'md',
          [avatarClasses.radiusLg]: $radius === 'lg',
          [avatarClasses.sizeSm]: $size === 'sm',
          [avatarClasses.sizeMd]: $size === 'md',
          [avatarClasses.sizeLg]: $size === 'lg'
        },
        className
      )}
      {...props}
    />
  );
});

export default Avatar;