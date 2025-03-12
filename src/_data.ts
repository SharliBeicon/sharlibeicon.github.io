interface DiscogsResponse {
  pagination: Pagination;
  releases: Release[];
}

interface Pagination {
  page: number;
  pages: number;
  per_page: number;
  items: number;
  urls: {
    last: string;
    next: string;
  };
}

interface Release {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: BasicInformation;
}

interface BasicInformation {
  id: number;
  master_id: number;
  master_url: string;
  resource_url: string;
  thumb: string;
  cover_image: string;
  title: string;
  year: number;
  formats: Format[];
  artists: Artist[];
  labels: Label[];
  genres: string[];
  styles: string[];
}

interface Format {
  name: string;
  qty: string;
  text: string;
  descriptions: string[];
}

interface Artist {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
}

interface Label {
  name: string;
  catno: string;
  entity_type: string;
  entity_type_name: string;
  id: number;
  resource_url: string;
}

const URL =
  "https://api.discogs.com/users/sharlibeicon/collection/folders/0/releases?page=1&per_page=200&sort=artist";

async function request(): Promise<BasicInformation[] | null> {
  try {
    const response = await fetch(URL);
    const data: DiscogsResponse = await response.json();
    return data.releases.map((r) => r.basic_information);
  } catch (_) {
    return null;
  }
}

const collection = await request();

export { collection };
