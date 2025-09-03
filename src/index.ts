import {
  addonBuilder,
  serveHTTP,
  MetaPreview,
  ContentType,
  Manifest,
  Stream,
} from "stremio-addon-sdk";

const RADIO_STREAM_URL = "https://s2.radio.co/s2b2b68744/listen";
const STATUS_URL = "https://public.radio.co/stations/s2b2b68744/status";

const STATION_META_ID = "badradio:station";

type RadioStatusTrack = {
  title: string;
  artwork_url?: string;
  artwork_url_large?: string;
  start_time?: string;
};
type RadioStatus = {
  status: string;
  current_track?: RadioStatusTrack;
  logo_url?: string;
};

async function fetchStatus(): Promise<RadioStatus | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${STATUS_URL}?v=${Date.now()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as RadioStatus;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

const manifest: Manifest = {
  id: "com.sleeyax.badradio",
  version: "1.0.0",
  name: "badradio",
  description:
    "OG Phonk, Memphis, Houston, Trap & Trill | 24/7 radio stream with current track metadata",
  logo: "https://images.radio.co/station_logos/s2b2b68744.20200406095314.jpg",
  resources: ["stream", "meta", "catalog"],
  types: ["channel"],
  idPrefixes: ["badradio"],
  catalogs: [
    {
      type: "channel",
      id: "badradio_catalog",
      name: "badradio",
    },
  ],
};

async function handleCatalog(): Promise<{ metas: MetaPreview[] }> {
  const status = await fetchStatus();
  const trackTitle = status?.current_track?.title || "Live Stream";
  return {
    metas: [
      {
        id: STATION_META_ID,
        type: "channel",
        name: trackTitle,
        poster:
          status?.current_track?.artwork_url_large ||
          status?.current_track?.artwork_url ||
          manifest.logo ||
          "",
        posterShape: "square" as const,
        description: "badradio 24/7 stream",
      },
    ],
  };
}

async function handleMeta(id: string) {
  if (id !== STATION_META_ID) throw new Error("Not found");
  const status = await fetchStatus();
  const trackTitle = status?.current_track?.title || "Live Stream";
  return {
    meta: {
      id: STATION_META_ID,
      type: "channel" as ContentType,
      name: "badradio",
      poster:
        status?.current_track?.artwork_url_large ||
        status?.current_track?.artwork_url ||
        manifest.logo,
      posterShape: "square" as const,
      description: trackTitle,
      background: status?.current_track?.artwork_url_large,
      logo: status?.logo_url || manifest.logo,
      releaseInfo: "Live",
      website: "https://badradio.nz",
      genres: ["channel", "Music"],
    },
  };
}

async function handleStream(id: string) {
  if (id !== STATION_META_ID) throw new Error("Not found");
  const status = await fetchStatus();
  const title = status?.current_track?.title || "badradio";
  const streams: Stream[] = [
    {
      url: RADIO_STREAM_URL,
      title,
      name: "badradio",
    },
  ];
  return { streams };
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(
  async ({ type, id }: { type: string; id: string }) => {
    if (type === "channel" && id === "badradio_catalog")
      return await handleCatalog();
    return { metas: [] };
  }
);

builder.defineMetaHandler(async ({ id }: { id: string }) => handleMeta(id));

builder.defineStreamHandler(async ({ id }: { id: string }) => handleStream(id));

const addonInterface = builder.getInterface();

const port = Number(process.env.PORT) || 7000;

serveHTTP(addonInterface, { port });
