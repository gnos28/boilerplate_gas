import { convertToHash } from "./global";
import { uberLogger } from "./uberLogger";
import { cacheManager } from "./cacheManager";

type ServiceAccount = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
};

type OauthParams = {
  serviceName: string;
  serviceAccount: ServiceAccount;
  scopes: string[];
  userToImpersonate?: string;
};

export type DataFormatedItem<FieldNames extends string> = Record<
  FieldNames,
  string | number | undefined
>;

export type BigQueryAwaitingResult = {
  kind: string;
  jobReference: JobReference;
  jobComplete: false;
  queryId: string;
};

export type JobReference = {
  projectId: string;
  jobId: string;
  location: string;
};

export type BigQueryResult<FieldNames extends string> = {
  kind: string;
  schema: BigQuerySchema<FieldNames>;
  jobReference: BigQueryJobReference;
  totalRows: string;
  rows: BigQueryRow[];
  totalBytesProcessed: string;
  jobComplete: true;
  cacheHit: boolean;
};

export type BigQueryJobReference = {
  projectId: string;
  jobId: string;
  location: string;
};

export type BigQueryRow = {
  f: BigQueryF[];
};

export type BigQueryF = {
  v: string;
};

export type BigQuerySchema<FieldNames extends string> = {
  fields: BigQueryField<FieldNames>[];
};

export type BigQueryField<FieldNames extends string> = {
  name: FieldNames;
  type: BigQueryType;
  mode: BigQueryMode;
};

export type BigQueryMode = "NULLABLE";

export type BigQueryType = "STRING" | "FLOAT" | "INTEGER" | "DATE";

const getServiceAccount = () => {
  const scriptProperties = PropertiesService.getScriptProperties();

  const serviceAccountString = scriptProperties.getProperty("serviceAccount");

  if (serviceAccountString === null) throw new Error("serviceAccount === null");

  return JSON.parse(serviceAccountString) as ServiceAccount;
};

// const { private_key, client_email, project_id } = serviceAccount;

const createService = (
  name: string,
  serviceAccount: ServiceAccount,
  scopes: string[],
  userToImpersonate?: string
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (OAuth2 as any)
    .createService(name)
    .setSubject(userToImpersonate)
    .setTokenUrl("https://accounts.google.com/o/oauth2/token")
    .setPrivateKey(serviceAccount.private_key)
    .setIssuer(serviceAccount.client_email)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setCache(CacheService.getUserCache())
    .setLock(LockService.getUserLock())
    .setScope(scopes);

const sendRequest = (
  url: string,
  oauthParams: OauthParams,
  // payload: string
  payload?: GoogleAppsScript.URL_Fetch.Payload
) => {
  const { serviceName, serviceAccount, scopes, userToImpersonate } =
    oauthParams;

  const oauthService = createService(
    serviceName,
    serviceAccount,
    scopes,
    userToImpersonate
  );

  if (!oauthService.hasAccess()) {
    Logger.log("BQ ERROR IS " + oauthService.getLastError());
    return;
  }

  const headers = {
    Authorization: `Bearer ${oauthService.getAccessToken()}`,
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    headers,
    contentType: "application/json",
    payload: payload ? JSON.stringify(payload) : undefined,
    muteHttpExceptions: true,
  };

  return JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
};

const parseFloatNotNaN = (rawString: string) => {
  const maybeNumber = parseFloat(rawString);
  if (isNaN(maybeNumber)) return rawString;
  return maybeNumber;
};

const formatBigQueryResult = <FieldNames extends string>(
  bigQueryResult: BigQueryResult<FieldNames>
) => {
  const fields = bigQueryResult.schema.fields;

  const formattedResult = bigQueryResult.rows.map(
    (row) =>
      Object.fromEntries(
        new Map(
          row.f.map((f, fIndex) => {
            const value =
              fields[fIndex].type === "STRING" || fields[fIndex].type === "DATE"
                ? f.v
                : parseFloatNotNaN(f.v);

            return [fields[fIndex].name, value];
          })
        )
      ) as DataFormatedItem<FieldNames>
  );

  return formattedResult;
};

const runGenericQuery = <FieldNames extends string>(query: string) => {
  uberLogger.info("runGenericQuery");

  const oauthParams: OauthParams = {
    serviceName: "BigQuery",
    serviceAccount: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/bigquery"],
  };
  const gcpProject = "vg1p-apps-gassupeco-prd-0e";
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/queries`;
  const payload: GoogleAppsScript.URL_Fetch.Payload = {
    query,
    useLegacySql: false,
    timeoutMs: 60 * 1000,
  };

  return sendRequest(url, oauthParams, payload) as
    | BigQueryAwaitingResult
    | BigQueryResult<FieldNames>;
};

const askForQueryResult = <FieldNames extends string>(jobId: string) => {
  uberLogger.info("runGenericQuery");

  const oauthParams: OauthParams = {
    serviceName: "BigQuery",
    serviceAccount: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/bigquery"],
  };
  const gcpProject = "vg1p-apps-gassupeco-prd-0e";
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/queries/${jobId}`;

  return sendRequest(url, oauthParams) as
    | BigQueryAwaitingResult
    | BigQueryResult<FieldNames>;
};

type HandleQueryRetriesProps =
  | {
      query?: undefined;
      jobId: string;
    }
  | {
      query: string;
      jobId?: undefined;
    };
const handleQueryRetries = <FieldNames extends string>({
  query,
  jobId,
}: HandleQueryRetriesProps): BigQueryResult<FieldNames> => {
  const rawQueryResult =
    query !== undefined
      ? runGenericQuery<FieldNames>(query)
      : askForQueryResult<FieldNames>(jobId);

  uberLogger.log({ rawQueryResult });

  if (rawQueryResult.jobComplete === false) {
    uberLogger.warn("boloss");

    Utilities.sleep(10 * 1000);

    return handleQueryRetries({ jobId: rawQueryResult.jobReference.jobId });
  }

  return rawQueryResult;
};

/**
 * bigQuery handler with 30 minutes cache
 */
export const queryHandler = <FieldNames extends string>(query: string) => {
  uberLogger.log(`queryHandler ${query}`);

  const cache = cacheManager();

  const queryKey = convertToHash(query).toString();

  const queryFromCache =
    cache.retrieveFromCache<DataFormatedItem<FieldNames>[]>(queryKey);

  if (queryFromCache !== undefined) {
    return queryFromCache;
  }

  const rawQueryResult = handleQueryRetries<FieldNames>({ query });

  const queryResult = formatBigQueryResult<FieldNames>(rawQueryResult);

  cache.storeInCache(queryKey, queryResult);

  return queryResult;
};
