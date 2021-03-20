import { useHistory } from 'react-router-dom';

import { ArrowLeftIcon } from 'assets/icons';

import Breadcrumb from '../Breadcrumb';
import Button from '../Button';
import Text from '../Text';

type MarketHeadProps = {
  section: string;
  subsection: string;
  imageUrl: string;
  description: string;
};

const MarketHead = ({
  section,
  subsection,
  imageUrl,
  description
}: MarketHeadProps) => {
  const history = useHistory();

  return (
    <div className="market-head">
      <img className="market-head__image" alt="market head" src={imageUrl} />
      <div className="market-head__details">
        <Breadcrumb previous={section} actual={subsection} />
        <Text as="p" scale="body" fontWeight="medium">
          {description}
        </Text>
      </div>
      <div className="market-head__actions">
        <Button
          icon={<ArrowLeftIcon />}
          iconPosition="left"
          onClick={() => history.push('/home')}
          aria-label="Back to Markets"
        >
          <Text as="span" scale="caption" fontWeight="semibold">
            Back to Markets
          </Text>
        </Button>
      </div>
    </div>
  );
};

MarketHead.displayName = 'Market head';

export default MarketHead;