import axios from 'axios';
import url from '~/api/url';

export default {
  getListProvince: async () =>
    axios
      .get<Province[]>(`${url.apiWilayahIndonesia}/provinces.json`)
      .then((res) => res.data),
  getListCity: async ({ provinceId }: { provinceId: string | null }) =>
    provinceId
      ? axios
          .get<City[]>(
            `${url.apiWilayahIndonesia}/regencies/${provinceId}.json`
          )
          .then((res) => res.data)
      : undefined,
  getListRegency: async ({ cityId }: { cityId: string | null }) =>
    cityId
      ? axios
          .get<District[]>(
            `${url.apiWilayahIndonesia}/districts/${cityId}.json`
          )
          .then((res) => res.data)
      : undefined,
  getListVillage: async ({ districtId }: { districtId: string | null }) =>
    districtId
      ? axios
          .get<Neighborhood[]>(
            `${url.apiWilayahIndonesia}/villages/${districtId}.json`
          )
          .then((res) => res.data)
      : undefined,
};

export type Neighborhood = {
  id: string;
  district_id: string;
  name: string;
};

export type District = {
  id: string;
  regency_id: string;
  name: string;
};

export type City = {
  id: string;
  province_id: string;
  name: string;
};

export type Province = {
  id: string;
  name: string;
};
