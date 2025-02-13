/* eslint-disable consistent-return */
/* eslint-disable import-helpers/order-imports */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache();
app.use(helmet.frameguard({ action: 'deny' }));

app.use((request, response, next) => {
  if (
    request.headers['x-forwarded-proto'] !== 'https' &&
    process.env.NODE_ENV !== 'development' &&
    request.hostname !== 'localhost' &&
    !request.secure
  ) {
    return response.redirect(
      `https://${request.headers.host}${request.originalUrl}`
    );
  }

  next();
});

const fs = require('fs');
const path = require('path');
const { isTrue } = require('./helpers/boolean');
const { roundNumber } = require('./helpers/number');

const { getMarket } = require('./api/market');
const { getLeaderboardGroupBySlug } = require('./api/group_leaderboards');
const { getTournamentBySlug } = require('./api/tournaments');
const { getLandBySlug } = require('./api/lands');
const {
  formatMarketMetadata,
  replaceToMetadataTemplate
} = require('./helpers/string');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './embed'));
app.use('/public', express.static(path.resolve(__dirname, '..', 'public')));

const port = process.env.PORT || 5000;

const isFantasyEnabled = isTrue(process.env.REACT_APP_FEATURE_FANTASY);
const isFantasyWhitelistEnabled = isTrue(
  process.env.REACT_APP_FEATURE_FANTASY_WHITELIST
);
const isAchievementsEnabled = isTrue(
  process.env.REACT_APP_FEATURE_ACHIEVEMENTS
);
const isTournamentsEnabled = isTrue(process.env.REACT_APP_FEATURE_TOURNAMENTS);
const isClubsEnabled = isTrue(process.env.REACT_APP_FEATURE_CLUBS);

const outcomesSortingAlphabeticallyEnabled = isTrue(
  process.env.REACT_APP_UI_MARKET_OUTCOMES_SORTING_ALPHABETICALLY
);
const outcomesSortingAlphabeticallyExclude =
  process.env.REACT_APP_UI_MARKET_OUTCOMES_SORTING_ALPHABETICALLY_EXCLUDE?.split(
    ','
  );

const localizeConfig = process.env.REACT_APP_LOCALIZE_CONFIG;

const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');

// fetching available metadata from env variables
const defaultMetadata = {
  title:
    process.env.REACT_APP_METADATA_TITLE ||
    'Polkamarkets - Autonomous Prediction Markets',
  description:
    process.env.REACT_APP_METADATA_DESCRIPTION ||
    'Polkamarkets is a DeFi-Powered Prediction Market built for cross-chain information exchange.',
  image: process.env.REACT_APP_METADATA_IMAGE || '/metadata-homepage.png'
};

const metadataByPage = {
  achievements: {
    title:
      process.env.REACT_APP_METADATA_ACHIEVEMENTS_TITLE ||
      'Achievements - Polkamarkets',
    description:
      process.env.REACT_APP_METADATA_ACHIEVEMENTS_DESCRIPTION ||
      'Place predictions in the Polkamarkets app and grab your exclusive NFT Achievements.',
    image:
      process.env.REACT_APP_METADATA_ACHIEVEMENTS_IMAGE ||
      '/metadata-homepage.png'
  },
  clubs: {
    title: process.env.REACT_APP_METADATA_CLUBS_TITLE || 'Clubs - Polkamarkets',
    description:
      process.env.REACT_APP_METADATA_CLUBS_DESCRIPTION ||
      "Build your own Club, league and leaderboard with your friends, against colleagues or around communities. Wear your own logo, tease your clubmates and let all fight to climb the Club's leaderboard.",
    image:
      process.env.REACT_APP_METADATA_CLUBS_IMAGE || '/metadata-homepage.png'
  },
  tournaments: {
    title:
      process.env.REACT_APP_METADATA_TOURNAMENTS_TITLE ||
      'Tournaments - Polkamarkets',
    description: process.env.REACT_APP_METADATA_TOURNAMENTS_DESCRIPTION || '',
    image:
      process.env.REACT_APP_METADATA_TOURNAMENTS_IMAGE ||
      '/metadata-homepage.png'
  },
  leaderboard: {
    title:
      process.env.REACT_APP_METADATA_LEADERBOARD_TITLE ||
      'Leaderboard - Polkamarkets',
    description:
      process.env.REACT_APP_METADATA_LEADERBOARD_DESCRIPTION ||
      'Rank up higher on the leaderboard and be the #1 forecaster of Polkamarkets.',
    image:
      process.env.REACT_APP_METADATA_LEADERBOARD_IMAGE ||
      '/metadata-leaderboard.png'
  },
  portfolio: {
    title:
      process.env.REACT_APP_METADATA_PORTFOLIO_TITLE ||
      'Portfolio - Polkamarkets',
    description:
      process.env.REACT_APP_METADATA_PORTFOLIO_DESCRIPTION ||
      'Participate in the Polkamarkets app and compete with your friends, coworkers or other community members.',
    image:
      process.env.REACT_APP_METADATA_PORTFOLIO_IMAGE ||
      '/metadata-portfolio.png'
  }
};

const defaultMetadataTemplate = (request, htmlData) => {
  return replaceToMetadataTemplate({
    htmlData,
    url: `${request.headers['x-forwarded-proto'] || 'http'}://${
      request.headers.host
    }${request.url}`,
    title: defaultMetadata.title,
    description: defaultMetadata.description,
    image: defaultMetadata.image.startsWith('http')
      ? defaultMetadata.image
      : `${request.headers['x-forwarded-proto'] || 'http'}://${
          request.headers.host
        }${defaultMetadata.image}`
  });
};

const metadataByPageTemplate = (page, request, htmlData) => {
  const metadata = metadataByPage[page];

  return replaceToMetadataTemplate({
    htmlData,
    url: `${request.headers['x-forwarded-proto'] || 'http'}://${
      request.headers.host
    }${request.url}`,
    title: metadata.title,
    description: metadata.description,
    image: metadata.image.startsWith('http')
      ? metadata.image
      : `${request.headers['x-forwarded-proto'] || 'http'}://${
          request.headers.host
        }${metadata.image}`
  });
};

const buildImageUrl = (imageUrl, defaultImage, request) => {
  let url;

  if (imageUrl && imageUrl.startsWith('http')) {
    url = imageUrl;
  } else if (defaultImage.startsWith('http')) {
    url = defaultImage;
  } else {
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const { host } = request.headers;
    url = `${protocol}://${host}${defaultImage}`;
  }

  return url;
};

app.get('/', (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    if (isFantasyEnabled && isTournamentsEnabled) {
      return response.send(
        metadataByPageTemplate('tournaments', request, htmlData)
      );
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/embed/markets/:slug', async (request, response) => {
  // adding X-Frame-Options header to allow embedding
  response.set('X-Frame-Options', 'ALLOWALL');

  const marketSlug = request.params.slug;
  const maxVisibleOutcomes = parseFloat(request.query.outcomes);

  const cacheKey = maxVisibleOutcomes ? `${marketSlug}-${maxVisibleOutcomes}` : marketSlug;

  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    response.render('markets/index', cachedData);
  } else {
    try {
      const market = await getMarket(marketSlug);
      const { outcomes: marketOutcomes, tournaments } = market.data;

      const outcomes = marketOutcomes.sort((compareA, compareB) => {
        if (outcomesSortingAlphabeticallyEnabled) {
          const exclude = outcomesSortingAlphabeticallyExclude || [];

          if (exclude.includes(compareA.title.toLowerCase())) return 1;

          return compareA.title.localeCompare(compareB.title);
        }

        return compareB.price - compareA.price;
      });

      const isValidMax =
        !Number.isNaN(maxVisibleOutcomes) &&
        Number.isFinite(maxVisibleOutcomes) &&
        maxVisibleOutcomes >= 2 &&
        maxVisibleOutcomes <= outcomes.length;

      const max = isValidMax ? maxVisibleOutcomes - 1 : 2;

      const multipleOutcomes = outcomes.length > max;
      const on = multipleOutcomes ? outcomes.slice(0, max) : outcomes;
      const off = multipleOutcomes ? outcomes.slice(max) : [];

      const tournament =
        tournaments && tournaments.length > 0 ? tournaments[0] : null;

      const land = tournament?.land;

      const data = {
        market: {
          ...market.data,
          outcomes: {
            on: on.map(outcome => {
              const priceChart = outcome.priceCharts?.find(
                chart => chart.timeframe === '24h'
              );

              return {
                ...outcome,
                percentage: `${roundNumber(+outcome.price * 100, 1)} %`,
                isPriceUp:
                  !priceChart?.changePercent || priceChart?.changePercent > 0
              };
            }),
            off: off.length > 0 && {
              title: `${off.length}+ Outcomes`,
              subtitle: `${off.map(outcome => outcome.title).join(', ')}`,
              price: roundNumber(
                +off.reduce((prices, outcome) => outcome.price + prices, 0),
                1
              )
            }
          }
        },
        land,
        localizeConfig
      };

      cache.set(cacheKey, data);

      response.render('markets/index', data);
    } catch (e) {
      return response.status(404).end();
    }
  }
});

app.get('/blocked', (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/whitelist', (request, response) => {
  if (!isFantasyWhitelistEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/reset', (request, response) => {
  if (!isFantasyEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

// app.get('/portfolio', (request, response) => {
//   fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
//     if (error) {
//       return response.status(404).end();
//     }
//     return response.send(
//       metadataByPageTemplate('portfolio', request, htmlData)
//     );
//   });
// });

app.get('/achievements', (request, response) => {
  if (!isAchievementsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(
      metadataByPageTemplate('achievements', request, htmlData)
    );
  });
});

app.get('/clubs', (request, response, next) => {
  if (!isClubsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }
    return response.send(metadataByPageTemplate('clubs', request, htmlData));
  });
});

app.get('/clubs/:slug', async (request, response, next) => {
  if (!isClubsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    const groupSlug = request.params.slug;

    try {
      const leaderboardGroup = await getLeaderboardGroupBySlug(groupSlug);
      const { title, bannerUrl } = leaderboardGroup.data;

      return response.send(
        replaceToMetadataTemplate({
          htmlData,
          url: `${request.headers['x-forwarded-proto'] || 'http'}://${
            request.headers.host
          }/clubs/${request.params.slug}`,
          title: `${title} - ${defaultMetadata.title}`,
          description:
            metadataByPage.clubs.description || defaultMetadata.description,
          image:
            bannerUrl ||
            `${request.headers['x-forwarded-proto'] || 'http'}://${
              request.headers.host
            }${defaultMetadata.image}`
        })
      );
    } catch (e) {
      return response.send(defaultMetadataTemplate(request, htmlData));
    }
  });
});

// app.get('/tournaments', (request, response, next) => {
//   if (!isTournamentsEnabled) {
//     next();
//     return;
//   }

//   fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
//     if (error) {
//       return response.status(404).end();
//     }
//     return response.send(
//       metadataByPageTemplate('tournaments', request, htmlData)
//     );
//   });
// });

app.get('/tournaments/:slug', async (request, response, next) => {
  if (!isTournamentsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    const tournamentSlug = request.params.slug;

    try {
      const tournament = await getTournamentBySlug(tournamentSlug);
      const { title, land } = tournament.data;

      return response.send(
        replaceToMetadataTemplate({
          htmlData,
          url: `${request.headers['x-forwarded-proto'] || 'http'}://${
            request.headers.host
          }/tournaments/${request.params.slug}`,
          title: `${title} - ${defaultMetadata.title}`,
          description:
            metadataByPage.tournaments.description ||
            defaultMetadata.description,
          image: buildImageUrl(land?.bannerUrl, defaultMetadata.image, request)
        })
      );
    } catch (e) {
      return response.send(defaultMetadataTemplate(request, htmlData));
    }
  });
});

app.get('/tournaments/:slug/leaderboard', async (request, response, next) => {
  if (!isFantasyEnabled || !isTournamentsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    const tournamentSlug = request.params.slug;

    try {
      const tournament = await getTournamentBySlug(tournamentSlug);
      const { title, land } = tournament.data;

      return response.send(
        replaceToMetadataTemplate({
          htmlData,
          url: `${request.headers['x-forwarded-proto'] || 'http'}://${
            request.headers.host
          }/tournaments/${request.params.slug}`,
          title: `${title} - ${defaultMetadata.title}`,
          description:
            metadataByPage.tournaments.description ||
            defaultMetadata.description,
          image: buildImageUrl(land.bannerUrl, defaultMetadata.image, request)
        })
      );
    } catch (e) {
      return response.send(defaultMetadataTemplate(request, htmlData));
    }
  });
});

app.get('/leaderboard', (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }
    return response.send(
      metadataByPageTemplate('leaderboard', request, htmlData)
    );
  });
});

app.get('/leaderboard/:slug', async (request, response, next) => {
  if (!isClubsEnabled) {
    next();
    return;
  }

  response.redirect(`/clubs/${request.params.slug}`);
});

app.get('/lands/:slug', async (request, response, next) => {
  if (!isTournamentsEnabled) {
    next();
    return;
  }

  response.redirect(`/${request.params.slug}`);
});

app.get('/:slug', async (request, response, next) => {
  const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g.test(request.params.slug);

  if (!isValidSlug) {
    next();
    return;
  }

  if (!isTournamentsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    const landSlug = request.params.slug;

    try {
      const land = await getLandBySlug(landSlug);
      const { title, description, bannerUrl } = land.data;

      return response.send(
        replaceToMetadataTemplate({
          htmlData,
          url: `${request.headers['x-forwarded-proto'] || 'http'}://${
            request.headers.host
          }/${request.params.slug}`,
          title: `${title} | Foreland Alpha`,
          description: `${description}\nStart now with $ALPHA`,
          image: buildImageUrl(bannerUrl, defaultMetadata.image, request)
        })
      );
    } catch (e) {
      return response.send(defaultMetadataTemplate(request, htmlData));
    }
  });
});

app.get('/user/:address', (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/markets', (request, response) => {
  if (!isFantasyEnabled || !isTournamentsEnabled) {
    next();
    return;
  }

  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/markets/create', (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    return response.send(defaultMetadataTemplate(request, htmlData));
  });
});

app.get('/markets/:slug', async (request, response) => {
  fs.readFile(indexPath, 'utf8', async (error, htmlData) => {
    if (error) {
      return response.status(404).end();
    }

    const marketSlug = request.params.slug;

    try {
      const market = await getMarket(marketSlug);
      const { title, category, subcategory, expiresAt, bannerUrl } =
        market.data;

      const tournament =
        market.data.tournaments && market.data.tournaments.length > 0
          ? market.data.tournaments[0]
          : null;

      const marketMetadata = formatMarketMetadata({
        title,
        category,
        subcategory,
        expiresAt,
        bannerUrl
      });

      return response.send(
        replaceToMetadataTemplate({
          htmlData,
          url: `${request.headers['x-forwarded-proto'] || 'http'}://${
            request.headers.host
          }/markets/${request.params.slug}`,
          title: marketMetadata.title || defaultMetadata.title,
          description:
            marketMetadata.description || defaultMetadata.description,
          image: buildImageUrl(
            marketMetadata.image || tournament?.land?.bannerUrl,
            defaultMetadata.image,
            request
          )
        })
      );
    } catch (e) {
      return response.send(defaultMetadataTemplate(request, htmlData));
    }
  });
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('*', (_request, response) => {
  response.redirect('/');
});

app.listen(port, () => console.log(`Listening on port ${port}`));
