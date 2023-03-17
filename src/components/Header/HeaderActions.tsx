import { Fragment, useCallback, useEffect } from 'react';

import cn from 'classnames';
import { Container, isThemeDark, useTheme } from 'ui';

import { Button } from 'components/Button';
import ConnectMetamask from 'components/ConnectMetamask';
import Icon from 'components/Icon';
import NetworkSelector from 'components/NetworkSelector';
import WalletInfo from 'components/WalletInfo';

import { useAppSelector, usePortal } from 'hooks';

import headerClasses from './Header.module.scss';
import headerActionsClasses from './HeaderActions.module.scss';

function HeaderActionsWrapper(props: React.PropsWithChildren<{}>) {
  const Portal = usePortal({
    root: document.body
  });

  useEffect(() => {
    Portal.mount(true);
  }, [Portal]);

  return <Portal {...props} />;
}
export default function HeaderActions() {
  const isLoggedIn = useAppSelector(state => state.polkamarkets.isLoggedIn);
  const theme = useTheme();
  const handleTheme = useCallback(
    () =>
      theme.device.setMode(isThemeDark(theme.device.mode) ? 'light' : 'dark'),
    [theme.device]
  );
  const { Root, Wrapper } = theme.device.isDesktop
    ? { Root: Fragment, Wrapper: 'div' }
    : { Root: HeaderActionsWrapper, Wrapper: Container };

  return (
    <Root>
      <Wrapper
        className={cn(headerActionsClasses.root, {
          [headerClasses.container]: !theme.device.isDesktop
        })}
      >
        {theme.device.isDesktop && (
          <NetworkSelector
            responsive
            className={headerActionsClasses.network}
          />
        )}
        {isLoggedIn ? <WalletInfo /> : <ConnectMetamask />}
        <Button
          variant="ghost"
          color="default"
          aria-label="Switch theme"
          onClick={handleTheme}
          className={headerActionsClasses.theme}
        >
          <Icon
            name={isThemeDark(theme.device.mode) ? 'Sun' : 'Moon'}
            size="lg"
          />
        </Button>
      </Wrapper>
    </Root>
  );
}
