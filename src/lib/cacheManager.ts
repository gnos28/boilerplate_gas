import { uberLogger } from "./uberLogger";

type QueryPart = {
  index: number;
  nbParts: number;
  query: string;
};

type CacheManagerProps = {
  timeToLiveSeconds?: number;
  showLogs?: boolean;
};

export const cacheManager = (props?: CacheManagerProps) => {
  const TTL = props?.timeToLiveSeconds || 1800;
  const SHOW_LOGS = props?.showLogs || true;

  const documentCache = CacheService.getDocumentCache();
  if (documentCache === null) throw new Error("documentCache === null");

  const buildMergedQueryString = (queryPart: QueryPart, queryKey: string) =>
    [
      queryPart.query,
      ...[...Array(queryPart.nbParts).keys()]
        .filter((index) => index !== 0)
        .map((index) => {
          const queryCached = documentCache.get(`${queryKey}_${index}`);
          if (queryCached === null) return "";

          const queryNextPart = JSON.parse(queryCached) as QueryPart;

          return queryNextPart.query;
        }),
    ].join("");

  const retrieveFromCache = <CacheItem>(queryKey: string) => {
    try {
      const queryCached = documentCache.get(`${queryKey}_0`);
      if (queryCached === null) throw new Error("queryCached === null");

      const queryPart = JSON.parse(queryCached) as QueryPart;

      const cacheItem = JSON.parse(
        queryPart.nbParts > 1
          ? buildMergedQueryString(queryPart, queryKey)
          : (JSON.parse(queryCached) as QueryPart).query
      ) as CacheItem;
      if (SHOW_LOGS)
        uberLogger.log(
          `🚀 using cache for ${queryKey} [${queryPart.nbParts} part(s)]`
        );
      return cacheItem;
    } catch (error) {
      if (SHOW_LOGS) uberLogger.log(`🐢 no cache found for ${queryKey}`);
      return undefined;
    }
  };

  const storeInCache = (queryKey: string, queryResult: unknown) => {
    try {
      const stringQueryResult = JSON.stringify(queryResult);

      const splitStringQueryResult = stringQueryResult.match(/.{1,45000}/g);

      if (splitStringQueryResult === null)
        throw new Error("splitStringQueryResult === null");

      const nbQueryPartToCache = splitStringQueryResult.length;

      const queryParts = splitStringQueryResult.map((queryPart, index) => ({
        index,
        nbParts: nbQueryPartToCache,
        query: queryPart,
      })) as QueryPart[];

      queryParts.forEach((queryPart) => {
        documentCache.put(
          `${queryKey}_${queryPart.index}`,
          JSON.stringify(queryPart),
          TTL
        );
      });

      if (SHOW_LOGS)
        uberLogger.log(
          `💾 ${queryKey} stored in cache [${queryParts.length} part(s)]`
        );
    } catch (error) {
      if (SHOW_LOGS)
        uberLogger.warn(
          `💩 couldnt store data in cache ${(error as Error).message}`
        );
    }
  };

  return { retrieveFromCache, storeInCache };
};
